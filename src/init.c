#include "init.h"

void init_fonts(struct global_context *gctx)
{
	/* Fonts */
	struct nk_font *std, *big, *icons;
	struct nk_font_atlas *atlas;
	struct nk_font_config cfg_std = nk_font_config(0);
	struct nk_font_config cfg_big = nk_font_config(0);
	struct nk_font_config cfg_icons = nk_font_config(0);
	const nk_rune ranges_std[] = {
		0x0020, 0x007E, /* Ascii */
		0x00A1, 0x00FF, /* Symbols + Umlaute */
		0};
	const nk_rune ranges_icons[] = {
		0xF00D, 0xF00D, /*  */
		0xF07C, 0xF07C, /*  */
		0xF083, 0xF083, /*  */
		0xF0AD, 0xF0AD, /*  */
		0xF021, 0xF021, /*  */
		0xF1C5, 0xF1C5, /*  */
		0xF063, 0xF063, /*  */
		0xF053, 0xF053, /*  */
		0xF054, 0xF054, /*  */
		0};

	gctx->std.ranges = malloc(sizeof(ranges_std));
	gctx->icons.ranges = malloc(sizeof(ranges_icons));
	memcpy(gctx->std.ranges, ranges_std, sizeof(ranges_std));
	memcpy(gctx->icons.ranges, ranges_icons, sizeof(ranges_icons));

	cfg_std.range = gctx->std.ranges;
	/* Big text size and small size use the same glyph ranges */
	cfg_big.range = gctx->std.ranges;
	cfg_icons.range = gctx->icons.ranges;
	cfg_std.oversample_h = cfg_std.oversample_v = 1;
	cfg_big.oversample_h = cfg_icons.oversample_v = 1;
	cfg_icons.oversample_h = cfg_icons.oversample_v = 1;
	cfg_std.pixel_snap = true;
	cfg_big.pixel_snap = true;
	cfg_icons.pixel_snap = true;

	nk_sdl_font_stash_begin(&atlas);
	std = nk_font_atlas_add_from_file(
		atlas, "res/font/roboto.ttf", 22 * gctx->interface_mult, &cfg_std);
	big = nk_font_atlas_add_from_file(
		atlas, "res/font/roboto.ttf", 32 * gctx->interface_mult, &cfg_big);
	icons = nk_font_atlas_add_from_file(
		atlas, "res/font/icons.ttf", 46 * gctx->interface_mult, &cfg_icons);
	nk_sdl_font_stash_end();

	gctx->std.handle = &std->handle;
	gctx->big.handle = &big->handle;
	gctx->icons.handle = &icons->handle;
	nk_style_set_font(gctx->ctx, gctx->std.handle);
}

void init_shaders(struct global_context *gctx)
{
	gctx->crop_shader.shader =
		compile_shader("res/shd/crop.vs", "res/shd/crop.fs");
	gctx->projection_shader.shader =
		compile_shader("res/shd/project.vs", "res/shd/project.fs");
	gctx->border_shader.shader =
		compile_shader("res/shd/border.vs", "res/shd/border.fs");

	float unitquadtex[] = {
		-1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 0.0,
		1.0, -1.0, 1.0, 1.0,
		-1.0, -1.0, 0.0, 1.0};

	float unitquad_small[] = {
		-1.0, 1.0,
		1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0};

	glGenBuffers(1, &gctx->bgvbo);
	glBindBuffer(GL_ARRAY_BUFFER, gctx->bgvbo);
	glBufferData(GL_ARRAY_BUFFER, sizeof(unitquadtex), unitquadtex,
				 GL_STATIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &gctx->border_shader.quadvbo);
	glBindBuffer(GL_ARRAY_BUFFER, gctx->border_shader.quadvbo);
	glBufferData(GL_ARRAY_BUFFER, sizeof(unitquad_small), unitquad_small,
				 GL_STATIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &gctx->rayvbo);

	gctx->border_shader.vtx =
		glGetAttribLocation(gctx->border_shader.shader, "vtx");
	gctx->border_shader.aspect_w =
		glGetUniformLocation(gctx->border_shader.shader, "aspect_w");
	gctx->border_shader.aspect_h =
		glGetUniformLocation(gctx->border_shader.shader, "aspect_h");
	gctx->border_shader.crop =
		glGetUniformLocation(gctx->border_shader.shader, "crop");
	gctx->border_shader.scale =
		glGetUniformLocation(gctx->border_shader.shader, "scale");
	gctx->border_shader.transform =
		glGetUniformLocation(gctx->border_shader.shader, "transform");
	gctx->border_shader.color =
		glGetUniformLocation(gctx->border_shader.shader, "color");

	gctx->crop_shader.vtx =
		glGetAttribLocation(gctx->crop_shader.shader, "vtx");
	gctx->crop_shader.coord =
		glGetAttribLocation(gctx->crop_shader.shader, "coord");
	gctx->crop_shader.aspect_w =
		glGetUniformLocation(gctx->crop_shader.shader, "aspect_w");
	gctx->crop_shader.aspect_h =
		glGetUniformLocation(gctx->crop_shader.shader, "aspect_h");
	gctx->crop_shader.crop =
		glGetUniformLocation(gctx->crop_shader.shader, "crop");

	gctx->projection_shader.pos =
		glGetAttribLocation(gctx->projection_shader.shader, "pos");
	gctx->projection_shader.viewray =
		glGetAttribLocation(gctx->projection_shader.shader, "rayvtx");
	gctx->projection_shader.scaler =
		glGetUniformLocation(gctx->projection_shader.shader, "scalar");
	gctx->projection_shader.crop =
		glGetUniformLocation(gctx->projection_shader.shader, "crop");
}