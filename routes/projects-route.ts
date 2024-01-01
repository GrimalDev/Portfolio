import express from 'express';
import {
  addProject, deleteProject,
  getProjectBySlug,
  getProjects,
} from "../app/controllers/projectsController.js";
import {getAllLanguages} from "../app/controllers/languageController.js";
import markdownTranslate, {markdownToPdf} from "../app/models/markdown-translate.js";
import * as fs from "fs";
import {phraseToSlug} from "../app/models/articlesHelper.js";
import {isAdmin, isAuth} from "../app/models/userHelpers.js";
import AdmZip from "adm-zip";
import path from "path";

const router = express.Router();

/* GET articles page. */
router.get('/', async function (res) {

    const languages = await getAllLanguages();

    res.render('projects', {languages: languages});
});

router.get('/query', async function(req, res) {
    //if no query string, the first 10 projects are displayed
    //if query string, the projects are filtered by the query string
    //if querry string is page, the projects are by pack of 10

    let searchParams = {
        languages: [],
        page: 1,
        customSearch: "",
        categories: [],
        setParams(languages: string|string[], page: number, customSearch = "", categories = []) {
            this.languages = languages;
            this.page = page;
            this.customSearch = customSearch;
            this.categories = categories;
        },
        toString() {
            let languages = this.languages;
            let page = this.page;
            let customSearch = this.customSearch;
            let categories = this.categories;
            if (languages.length === 0) {
                languages = "all";
            }
            if (customSearch === "") {
                customSearch = "None";
            }
            if (this.categories.length === 0) {
                categories = "all";
            }
            return `Languages: ${languages} + Page: ${page} + Custom search: ${customSearch} + Categories: ${categories}`;
        }
    }

    //default value
    if (!req.query.length) {
        searchParams.setParams([], 1);
    }

    //page
    if (req.query.page) {
        searchParams.page = req.query.page;
    }

    //language query
    if (req.query.languages) {
        searchParams.languages = req.query.languages.split(',');
    }

    //custom search
    if (req.query.search) {
        searchParams.customSearch = req.query.search;
    }

    //categories
    if (req.query.categories) {
        searchParams.categories = req.query.categories.split(',');
    }

    //query option for the database
    const queryOptions = {
        languages: searchParams.languages,
        pageNumber: searchParams.page,
        customSearch: searchParams.customSearch,
        categories: searchParams.categories
    }

    //execute query
    const queryResult = await getProjects(queryOptions);

    //set the number of pages to display and the projects to display
    const maxPages  = queryResult.maxPages;
    const projects  = queryResult.projects;
    const message   = searchParams.toString();

    //convert the body and the description from markdown to html
    for (let i = 0; i < projects.length; i++) {
      projects[i].body = await markdownTranslate(projects[i].body);
      projects[i].description = await markdownTranslate(projects[i].description);
    }

    res.json({message: message, data: projects, maxPages: maxPages});
});

router.get('/view/:slug', async function(req, res, next) {
  const project = await getProjectBySlug(req.params.slug);

  //when no page is found, redirect to 404
  if (!project) {
      res.redirect('/error');
      return;
  }

  //If the body contains {{fooFilePath}} it will be replaced by the content of the file foo.html file path file
  //The root is the articles folder (public/articles_media/direct_images)
  const regex = /\{\{\!\!.*?\!\!\}\}/g;
  if (project.body.match(regex)) {
    const matches = project.body.match(regex);
    for (let i = 0; i < matches.length; i++) {
      const filePath = matches[i].replace("{{!!", "").replace("!!}}", "");

      // replace the placeholder with the actual html content of the html in the projects path in an iframe with notion fix stylesheet
      const iframe = `<iframe src="/articles_html/${filePath}" id="article-body__iframe"></iframe>`;
      project.body = project.body.replace(matches[i], iframe);
    }
  } else {
    //convert body from markdown to html
    project.body = await markdownTranslate(project.body);
  }

  //convert the description from markdown to html
  project.description = await markdownTranslate(project.description);

  res.render('content-single', {project: project, route: "projects"});
});

//Route to add a new project
router.post('/add', isAuth, isAdmin, async function(req, res, next) {

  //create project
  const project = {
    slug: "",
    title: req.body.title,
    description: req.body.description,
    body: req.body.body,
    img: "",
    languages_linked: req.body.languages_linked,
    categories: req.body.categories
  }
  const morefiles = req.files.morefiles;
  const finalStatus = {status: "ok", message: "Project added successfully"};

  //verify that all fields are completed
  let notCompleted = false;
  for (let i = 0; i < project; i++) {
    if (project[i] === undefined) {
      notCompleted = true;
    }
  }

  if (notCompleted) {
    finalStatus.status = "nook";
    finalStatus.message = "Please complete all fields";
  }

  //create slug
  project.slug = phraseToSlug(project.title);

  if (!req.files.img) {
    project.img = "new-article.webp";
  }

  //save image
  if (req.files.img) {
    const img = req.files.img;
    let imgPath = `./public/articles_media/direct_images/${project.slug}`;

    //add image format to the image path
    const imgFormat = img.name.split('.').pop();
    imgPath += `.${imgFormat}`;

    //set project image path
    project.img = `${project.slug}.${imgFormat}`;

    //if already an image with the same name, delete it
    if (fs.existsSync(imgPath)) {
      await fs.unlinkSync(imgPath);
    }

    req.files.img.mv(imgPath, function(err) {
      if (err) {
        finalStatus.status = "nook";
        finalStatus.message = "Error while uploading image";
      }
    });
  }

  //save morefiles if any
  if (morefiles) {
    const morefilesPath = `./public/articles_html/${project.slug}`;

    try {
      //create directory for the project files if it doesn't exist
      if (!fs.existsSync(morefilesPath)) {
        await fs.mkdirSync(morefilesPath);
      }

      //recursively delete a folder and its content
      const deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
          fs.readdirSync(path).forEach(function(file) {
            const curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
            } else { // delete file
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
      };

      //if folder has files in it, delete the folder and recreate it
      if (fs.existsSync(morefilesPath)) {
        deleteFolderRecursive(morefilesPath);
        await fs.mkdirSync(morefilesPath);
      }

      //save the zip file to the directory
      await morefiles.mv(`${morefilesPath}/${morefiles.name}`);

      await sleep(1000); //wait for the file to be saved

      //get root of the zip file
      const absolutePath = path.resolve(`${morefilesPath}/${morefiles.name}`);

      //unzip files in the directory
      const zip = new AdmZip(absolutePath);
      await zip.extractAllTo(morefilesPath, true);
      //delete the zip file
      if (fs.existsSync(`${morefilesPath}/${morefiles.name}`)) {
        await fs.unlinkSync(`${morefilesPath}/${morefiles.name}`);

      }

      //change the body to integrate the name of the first html file in the folder
      const firstHtmlFile = fs.readdirSync(morefilesPath).filter(file => file.endsWith(".html"))[0];
      project.body = `{{!!${project.slug}/${firstHtmlFile}!!}}`;
    } catch (err) {
      finalStatus.status = "nook";
      finalStatus.message = "Error while saving the zip file";
      console.log(err);
    }
  }

  //save the pdf if any (pdf is not mandatory)
  if (req.files.pdf) {
    const pdf = req.files.pdf;
    let pdfPath = `./public/articles_media/pdf/${project.slug}-doc.pdf`;

    //if the pdf already exists, delete it
    if (fs.existsSync(pdfPath)) {
      await fs.unlinkSync(pdfPath);
    }

    req.files.pdf.mv(pdfPath, function(err) {
      if (err) {
        finalStatus.status = "nook";
        finalStatus.message = "Error while saving the pdf file";
      }
    });
  }

  //send the status and don't save the project if the status is nook
  if (finalStatus.status === "nook") {
    res.json({status: finalStatus.status, message: finalStatus.message});
    return;
  }

  //if the project already exists, delete it
  const projectToDelete = await getProjectBySlug(project.slug);
  if (projectToDelete) {
    await deleteProject(projectToDelete._id);
  }

  //save project
  await addProject(project);

  res.json({status: finalStatus.status, message: finalStatus.message});
});

//route to delete a project
router.post('/delete', isAuth, isAdmin, async function(req, res, next) {
  const project = await getProjectBySlug(req.body.slug);
  const finalStatus = {status: "ok", message: "Project deleted successfully"};

  //if the project doesn't exist, send an error
  if (!project) {
    finalStatus.status = "nook";
    finalStatus.message = "Project doesn't exist";
    res.send(finalStatus);
    return;
  }

  //delete the project
  await deleteProject(project._id);

  res.json(finalStatus);
});

//get pdf version
router.get('/pdf/:slug', async function(req, res, next) {
  //check if the project exists
  const project = await getProjectBySlug(req.params.slug);
  if (!project) {
    res.render('not-found');
    return;
  }

  //pdf path
  const pdfPath = `public/articles_media/pdf/${project.slug}-doc.pdf`;
  let resultPdf;

  //if file does not exist, send pdf version of markdown body
  if (!fs.existsSync(pdfPath)) {
    project.body = `# ${project.title}\n## ${project.description}(${new Date(project.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })})\n\n${project.body}`;

    resultPdf = await markdownToPdf(project.body, pdfPath, {output: "raw"});
  } else {
    resultPdf = fs.readFileSync(pdfPath);
  }

  //send pdf file to the client
  res.set({
    "Content-Disposition": `inline; filename=${project.slug}.pdf`,
    "Content-Type": "application/pdf"
  });
  res.send(resultPdf);
});

async function sleep(ms : number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;