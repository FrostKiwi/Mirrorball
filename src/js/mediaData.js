const media = [
	{
		type: "image",
		title: "Bedroom",
		path: "/media/room.jpg",
		thumb: "/media/thumb/room.jpg",
		fileSize: "2.7 MB",
		width: "4096",
		height: "4096",
		sphere_fov: 346,
		crop: {
			top: 71,
			bot: 62,
			left: 62,
			right: 74
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 24,
			Roll: 1
		},
		camera_initial: {
			Yaw: -40,
			Pitch: -10
		}
	},
	{
		type: "video",
		title: "Walk-around",
		path: "/media/walkaround.mp4",
		thumb: "/media/thumb/walkaround.jpg",
		fileSize: "9.5 MB",
		width: "2048",
		height: "2048",
		sphere_fov: 346,
		crop: {
			top: 26,
			bot: 9,
			left: 22,
			right: 16
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 2
		},
		camera_initial: {
			Yaw: -60,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Eletronics store",
		path: "/media/store.jpg",
		thumb: "/media/thumb/store.jpg",
		fileSize: "2.2 MB",
		width: "2464",
		height: "2464",
		sphere_fov: 260,
		crop: {
			top: 97,
			bot: 125,
			left: 102,
			right: 113
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -88,
			Roll: 0
		},
		camera_initial: {
			Yaw: -120,
			Pitch: -40
		}
	},
	{
		type: "image",
		title: "Hardware store",
		path: "/media/store_hardware.jpg",
		thumb: "/media/thumb/store_hardware.jpg",
		fileSize: "2.08 MB",
		width: "2883",
		height: "2883",
		sphere_fov: 260,
		crop: {
			top: 3,
			bot: 106,
			left: 50,
			right: 57
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -90,
			Roll: 0
		},
		camera_initial: {
			Yaw: -120,
			Pitch: -35
		}
	},
	{
		type: "image",
		title: "Department store",
		path: "/media/store_yodobashi.jpg",
		thumb: "/media/thumb/store_yodobashi.jpg",
		fileSize: "2.08 MB",
		width: "2422",
		height: "2422",
		sphere_fov: 265,
		crop: {
			top: 31,
			bot: 17,
			left: 104,
			right: 70
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -90,
			Roll: 0
		},
		camera_initial: {
			Yaw: -175,
			Pitch: -45
		}
	},
	{
		type: "image",
		title: "Toothbrush POV",
		path: "/media/mouth.jpg",
		thumb: "/media/thumb/mouth.jpg",
		fileSize: "1.9 MB",
		width: "3200",
		height: "3200",
		sphere_fov: 304,
		crop: {
			top: 567,
			bot: 538,
			left: 555,
			right: 596
		},
		world_rotation: {
			Yaw: 25,
			Pitch: 18,
			Roll: 10
		},
		camera_initial: {
			Yaw: 0,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Giant Tokyo ball",
		path: "/media/tokyo.jpg",
		thumb: "/media/thumb/tokyo.jpg",
		fileSize: "1.6 MB",
		width: "2960",
		height: "2960",
		sphere_fov: 306,
		crop: {
			top: 32,
			bot: 39,
			left: 63,
			right: 17
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: -50,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Inverted earth",
		path: "/media/earth.jpg",
		thumb: "/media/thumb/earth.jpg",
		fileSize: "4.6 MB",
		width: "8192",
		height: "8192",
		source: "https://visibleearth.nasa.gov/images/147190/explorer-base-map",
		sphere_fov: 360,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: 0,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Gene Miller 1982",
		path: "/media/gene_miller.jpg",
		thumb: "/media/thumb/gene_miller.jpg",
		fileSize: "0.2 MB",
		width: "1536",
		height: "1024",
		source: "https://www.pauldebevec.com/ReflectionMapping/miller.html",
		sphere_fov: 310,
		crop: {
			top: 314,
			bot: 281,
			left: 561,
			right: 544
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: -100,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Postbank ¼ Mirror",
		path: "/media/postbank.jpg",
		thumb: "/media/thumb/postbank.jpg",
		fileSize: "1.5 MB",
		width: "4160",
		height: "3120",
		sphere_fov: 300,
		crop: {
			top: 446,
			bot: 476,
			left: 809,
			right: 1143
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -37,
			Roll: 0
		},
		camera_initial: {
			Yaw: -60,
			Pitch: -50
		}
	},
	{
		type: "image",
		title: "Soup ladle",
		path: "/media/ladle.jpg",
		thumb: "/media/thumb/ladle.jpg",
		fileSize: "0.5 MB",
		width: "2048",
		height: "2048",
		sphere_fov: 280,
		crop: {
			top: 42,
			bot: 15,
			left: 39,
			right: 24
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 7,
			Roll: 3
		},
		camera_initial: {
			Yaw: -70,
			Pitch: -23
		}
	},
	{
		type: "image",
		title: "Street lamp",
		path: "/media/lamp.jpg",
		thumb: "/media/thumb/lamp.jpg",
		fileSize: "1.9 MB",
		width: "4096",
		height: "4096",
		sphere_fov: 340,
		crop: {
			top: 151,
			bot: 110,
			left: 145,
			right: 119
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -17,
			Roll: 0
		},
		camera_initial: {
			Yaw: 0,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Different Rotations",
		path: "/media/rotation_compare.jpg",
		thumb: "/media/thumb/rotation_compare.jpg",
		fileSize: "4.38 MB",
		width: "8192",
		height: "4096",
		sphere_fov: 346,
		crop: {
			top: 74,
			bot: 75,
			left: 80,
			right: 4165
		},
		world_rotation: {
			Yaw: -50,
			Pitch: 2,
			Roll: -2.5
		},
		camera_initial: {
			Yaw: -40,
			Pitch: 0
		},
		ch2:{
			sphere_fov: 346,
			crop: {
				top: 71,
				bot: 62,
				left: 4158,
				right: 74
			},
			world_rotation: {
				Yaw: 0,
				Pitch: 24,
				Roll: 1
			},
		}
	},
	{
		type: "video",
		title: "Color + Thermal Grilled Cheese",
		path: "/media/cheese-eating.mp4",
		thumb: "/media/thumb/cheese-eating.jpg",
		fileSize: "14.9 MB",
		width: "2048",
		height: "2048",
		sphere_fov: 333,
		crop: {
			top: 147,
			bot: 14,
			left: 136,
			right: 26
		},
		world_rotation: {
			Yaw: -134,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: 60,
			Pitch: 0
		},
		ch2: {
			sphere_fov: 320,
			crop: {
				top: 17,
				bot: 1605,
				left: 16,
				right: 1610
			},
			world_rotation: {
				Yaw: 0,
				Pitch: -4,
				Roll: 1
			},
		}
	},
	{
		type: "video",
		title: "Microwave Cheese",
		path: "/media/microwave.mp4",
		thumb: "/media/thumb/microwave.jpg",
		fileSize: "17.1 MB",
		width: "2048",
		height: "2048",
		sphere_fov: 280,
		crop: {
			top: 39,
			bot: 52,
			left: 76,
			right: 26
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -3,
			Roll: 0
		},
		camera_initial: {
			Yaw: 30,
			Pitch: -20
		},
		ch2: {
			sphere_fov: 280,
			crop: {
				top: 30,
				bot: 1755,
				left: 51,
				right: 1709
			},
			world_rotation: {
				Yaw: -30,
				Pitch: -30,
				Roll: -15
			},
		}
	},
	{
		type: "video",
		title: "Color + Thermal Laser cladding",
		path: "/media/cladding.mp4",
		thumb: "/media/thumb/cladding.jpg",
		fileSize: "13.3 MB",
		width: "2048",
		height: "2048",
		source: "https://arxiv.org/abs/2308.10991",
		sphere_fov: 330,
		crop: {
			top: 190,
			bot: 21,
			left: 169,
			right: 39
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 1,
			Roll: 0
		},
		camera_initial: {
			Yaw: 70,
			Pitch: 0
		},
		ch2: {
			sphere_fov: 320,
			crop: {
				top: 7,
				bot: 1599,
				left: 11,
				right: 1581
			},
			world_rotation: {
				Yaw: -178,
				Pitch: -14,
				Roll: -177
			},
		}
	},
	{
		type: "video",
		title: "Laser cladding 2023",
		path: "/media/cladding2023.mp4",
		thumb: "/media/thumb/cladding2023.jpg",
		fileSize: "6.6 MB",
		width: "2048",
		height: "2048",
		source: "https://arxiv.org/abs/2308.10991",
		sphere_fov: 342,
		crop: {
			top: 19,
			bot: 14,
			left: 7,
			right: 13
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 2,
			Roll: 0
		},
		camera_initial: {
			Yaw: 55,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Roof",
		path: "/media/roof.jpg",
		thumb: "/media/thumb/roof.jpg",
		fileSize: "2.83 MB",
		width: "3884",
		height: "3884",
		sphere_fov: 339,
		crop: {
			top: 68,
			bot: 103,
			left: 79,
			right: 91
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: 90,
			Pitch: 0
		}
	},
	{
		type: "image",
		title: "Fire Hydrant",
		path: "/media/fire_hydrant.jpg",
		thumb: "/media/thumb/fire_hydrant.jpg",
		fileSize: "4.38 MB",
		width: "4096",
		height: "4096",
		sphere_fov: 330,
		crop: {
			top: 118,
			bot: 165,
			left: 170,
			right: 102
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 90,
			Roll: 0
		},
		camera_initial: {
			Yaw: -145,
			Pitch: -10
		}
	},
	{
		type: "image",
		title: "Movie VFX Probe",
		path: "/media/movie.jpg",
		thumb: "/media/thumb/movie.jpg",
		fileSize: "0.2 MB",
		width: "1079",
		height: "1080",
		sphere_fov: 330,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		world_rotation: {
			Yaw: 0,
			Pitch: -5,
			Roll: 0
		},
		camera_initial: {
			Yaw: 90,
			Pitch: -20
		}
	},
	{
		type: "image",
		title: "Security Camera",
		path: "/media/security_camera.jpg",
		thumb: "/media/thumb/security_camera.jpg",
		fileSize: "1.67 MB",
		width: "4096",
		height: "4096",
		sphere_fov: 260,
		crop: {
			top: 581,
			bot: 502,
			left: 614,
			right: 481
		},
		world_rotation: {
			Yaw: 4,
			Pitch: -98,	
			Roll: 0
		},
		camera_initial: {
			Yaw: -145,
			Pitch: -30
		}
	},
	{
		type: "image",
		title: "Distance comparison",
		path: "/media/distance.jpg",
		thumb: "/media/thumb/distance.jpg",
		fileSize: "5.51 MB",
		width: "8192",
		height: "4096",
		sphere_fov: 345,
		crop: {
			top: 33,
			bot: 96,
			left: 71,
			right: 4153
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: 180,
			Pitch: 0
		},
		ch2: {
			sphere_fov: 334,
			crop: {
				top: 80,
				bot: 88,
				left: 4182,
				right: 85
			},
			world_rotation: {
				Yaw: 0,
				Pitch: 0,
				Roll: 0
			},
		}
	},
	{
		type: "image",
		title: "Ball size comparison",
		path: "/media/size.jpg",
		thumb: "/media/thumb/size.jpg",
		fileSize: "5.44 MB",
		width: "8192",
		height: "4096",
		sphere_fov: 334,
		crop: {
			top: 80,
			bot: 88,
			left: 86,
			right: 4181
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: 180,
			Pitch: 0
		},
		ch2: {
			sphere_fov: 343,
			crop: {
				top: 103,
				bot: 112,
				left: 4201,
				right: 107
			},
			world_rotation: {
				Yaw: 0,
				Pitch: 0,
				Roll: 0
			},
		}
	},
	{
		type: "image",
		title: "ArchViz (3D-Render)",
		path: "/media/archviz.jpg",
		thumb: "/media/thumb/archviz.jpg",
		fileSize: "1.33 MB",
		width: "4096",
		height: "4096",
		sphere_fov: 360,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 0,
			Roll: 0
		},
		camera_initial: {
			Yaw: -60,
			Pitch: -10
		}
	},
	{
		type: "image",
		title: "Checkerboard",
		path: "/media/tisch.jpg",
		thumb: "/media/thumb/tisch.jpg",
		fileSize: "2.41 MB",
		width: "4000",
		height: "4000",
		sphere_fov: 320,
		crop: {
			top: 84,
			bot: 150,
			left: 116,
			right: 118
		},
		world_rotation: {
			Yaw: 0,
			Pitch: 34,
			Roll: 1
		},
		camera_initial: {
			Yaw: -52,
			Pitch: 5
		}
	}
];

export default media;