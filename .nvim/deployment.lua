return {
	["srvwebstr01"] = {
		host = "srvwebstr01",
		mappings = {
			{
				["local"] = ".",
				["remote"] = "/docker/node_servers/storage/portfolio/",
			},
		},
		excludedPaths = {
			"node_modules/", -- local path relative to project root
			".omo/",
			".nvim/",
			".git/",
			"tmp/",
		},
	},
}
