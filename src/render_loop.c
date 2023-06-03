#include "main.h"

float viewrays[] = {
	-1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 0.0, 0.0, 0.0,
	-1.0, -1.0, 0.0, 0.0, 0.0};

/* TODO: !!! BUFFER NOT FREED !!! */
EMSCRIPTEN_KEEPALIVE int load_file(uint8_t *buffer, size_t size)
{
	/* 	gctx.ch1.data = stbi_load_from_memory(buffer, size, &gctx.ch1.width,
											  &gctx.ch1.height,
											  &gctx.ch1.channels, 3);
		glDeleteTextures(1, &gctx.ch1.tex);
		glGenTextures(1, &gctx.ch1.tex);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx.ch1.tex);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, gctx.ch1.width, gctx.ch1.height, 0, GL_RGB,
					 GL_UNSIGNED_BYTE, gctx.ch1.data);
		stbi_image_free(gctx.ch1.data);
		glm_vec3_zero(gctx.cam.cam_rotation);
		glm_vec3_zero(gctx.ch1.rotation);
		gctx.ch1.fov_deg = 360;
		gctx.fov = glm_rad(100);
		gctx.ch1.crop.bot = gctx.ch1.crop.top = gctx.ch1.crop.left = gctx.ch1.crop.right = 0; */
	puts("Please make it till here");
	return 1;
}

void MainLoop(void *loopArg)
{
	struct global_context *gctx = (struct global_context *)loopArg;
	struct nk_context *ctx = gctx->ctx;
	/* Input */
	SDL_Event evt;
	nk_input_begin(ctx);
	while (SDL_PollEvent(&evt))
	{
		nk_sdl_handle_event(&evt);
		/*
					switch (evt.type)
					{
					case SDL_MOUSEMOTION:


					case SDL_MOUSEWHEEL:
						gctx.fov -= (float)evt.wheel.y * 0.1;

							gctx.fov += evt.mgesture.dDist;
							gctx.fov -= (float)evt.wheel.y;
						  if(evt.type == SDL_MOUSEBUTTONDOWN)
						  gctx.cam.cam_rotation[1] += evt.tfinger.dx * 0.001;
				} */
		switch (evt.type)
		{
			/* 		case SDL_KEYDOWN:
					{
						switch (evt.key.keysym.sym)
						{
						case SDLK_q:
							gctx.fov -= 0.01;
							break;
						case SDLK_e:
							gctx.fov += 0.01;
							break;
						case SDLK_UP:
							gctx.cam.cam_rotation[0] += 0.01;
							if (gctx.cam.cam_rotation[0] > M_PI / 2.0)
								gctx.cam.cam_rotation[0] = M_PI / 2.0;
							if (gctx.cam.cam_rotation[0] < M_PI / -2.0)
								gctx.cam.cam_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_DOWN:
							gctx.cam.cam_rotation[0] -= 0.01;
							if (gctx.cam.cam_rotation[0] > M_PI / 2.0)
								gctx.cam.cam_rotation[0] = M_PI / 2.0;
							if (gctx.cam.cam_rotation[0] < M_PI / -2.0)
								gctx.cam.cam_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_LEFT:	gctx.cam.cam_rotation[1] -= 0.01; break;
						case SDLK_RIGHT: gctx.cam.cam_rotation[1] += 0.01; break;
						}
					} */
		case SDL_FINGERMOTION:
			gctx->cam.cam_rotation[1] += evt.tfinger.dx * 2.0;
			gctx->cam.cam_rotation[0] += evt.tfinger.dy * 2.0;
			break;
		case SDL_MULTIGESTURE:
			gctx->cam.fov -= evt.mgesture.dDist * 4;
			break;
		}
	}
	nk_input_end(ctx);

	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx->cam.cam_rotation[1] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx->cam.cam_rotation[1] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_UP].down)
		gctx->cam.cam_rotation[0] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_DOWN].down)
		gctx->cam.cam_rotation[0] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx->cam.fov += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx->cam.fov -= 0.05;

	if (gctx->cam.cam_rotation[0] > M_PI / 2.0)
		gctx->cam.cam_rotation[0] = M_PI / 2.0;
	if (gctx->cam.cam_rotation[0] < M_PI / -2.0)
		gctx->cam.cam_rotation[0] = M_PI / -2.0;

	if (!nk_window_is_any_hovered(ctx))
	{
		gctx->cam.fov -= ctx->input.mouse.scroll_delta.y * 0.1;
	}

	/* Rotation input from mouse */

	if (gctx->cam.fov > gctx->cam.fovmax)
		gctx->cam.fov = gctx->cam.fovmax;
	if (gctx->cam.fov < gctx->cam.fovmin)
		gctx->cam.fov = gctx->cam.fovmin;

	int win_width, win_height;
	SDL_GetWindowSize(gctx->win, &win_width, &win_height);
	glViewport(0, 0, win_width, win_height);
	glClear(GL_COLOR_BUFFER_BIT);

	/* GUI */
	if (nk_begin(ctx, "Frost-O-Rama", nk_rect(20 * gctx->interface_mult, 20 * gctx->interface_mult, 400 * gctx->interface_mult, 600 * gctx->interface_mult),
				 NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE |
					 NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE))
	{
		nk_layout_row_dynamic(ctx, 18 * gctx->interface_mult, 1);
		nk_label(ctx, "Switch between Setup and Projection here", NK_TEXT_ALIGN_LEFT);
		nk_style_set_font(ctx, gctx->std.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 2);
		if (nk_option_label(ctx, "Crop image", !gctx->projection))
			gctx->projection = false;
		if (nk_option_label(ctx, "Project image", gctx->projection))
			gctx->projection = true;
		nk_layout_row_dynamic(ctx, 18 * gctx->interface_mult, 1);
		nk_label(ctx, "Arrow keys on computer or Touch-Drag on", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Smartphones to move the projection camera.", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Shift + Arrows or pinch to zoom", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Click-Drag or Touch-Drag over settings", NK_TEXT_ALIGN_LEFT);
		nk_style_set_font(ctx, gctx->big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 1);
		nk_label(ctx, "Input", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx->interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);
		nk_style_set_font(ctx, gctx->std.handle);
		if (nk_tree_push(ctx, NK_TREE_TAB, "Sample images", NK_MAXIMIZED))
		{
			ctx->style.button.text_normal = nk_rgb(175, 175, 175);
			ctx->style.button.text_hover = nk_rgb(175, 175, 175);
			ctx->style.button.text_active = nk_rgb(175, 175, 175);
			nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 1);
			if (nk_button_label(ctx, "Room"))
			{
				glm_vec3_zero(gctx->ch1.rotation);
				glm_vec3_zero(gctx->cam.cam_rotation);
				gctx->ch1.img = load_texture("res/img/room.jpg", gctx->ch1.img);
				gctx->cam.fov = glm_rad(100);
				gctx->cam.cam_rotation[1] = 1.5;
				gctx->ch1.crop.top = 46;
				gctx->ch1.crop.bot = 62;
				gctx->ch1.crop.left = 45;
				gctx->ch1.crop.right = 63;
				gctx->ch1.fov_deg = 342;
			}
			if (nk_button_label(ctx, "Department Store"))
			{
				glm_vec3_zero(gctx->ch1.rotation);
				glm_vec3_zero(gctx->cam.cam_rotation);
				gctx->ch1.img = load_texture("res/img/store.jpg", gctx->ch1.img);
				gctx->cam.fov = glm_rad(100);
				gctx->cam.cam_rotation[0] = -0.5;
				gctx->cam.cam_rotation[1] = 1.5;
				gctx->ch1.crop.top = 97;
				gctx->ch1.crop.bot = 125;
				gctx->ch1.crop.left = 102;
				gctx->ch1.crop.right = 113;
				gctx->ch1.rotation[0] = glm_rad(-88.3);
				gctx->ch1.fov_deg = 310.29;
			}
			if (nk_button_label(ctx, "Human Mouth"))
			{
				glm_vec3_zero(gctx->ch1.rotation);
				glm_vec3_zero(gctx->cam.cam_rotation);
				gctx->ch1.img = load_texture("res/img/mouth.jpg", gctx->ch1.img);
				gctx->cam.fov = glm_rad(100);
				gctx->cam.cam_rotation[1] = 3;
				gctx->ch1.crop.top = 567;
				gctx->ch1.crop.bot = 538;
				gctx->ch1.crop.left = 555;
				gctx->ch1.crop.right = 596;
				gctx->ch1.fov_deg = 304;
				gctx->ch1.rotation[0] = glm_rad(25);
				gctx->ch1.rotation[2] = glm_rad(1);
				gctx->cam.fov = glm_rad(125);
			}
			if (nk_button_label(ctx, "HUGE Tokyo Ball"))
			{
				glm_vec3_zero(gctx->ch1.rotation);
				glm_vec3_zero(gctx->cam.cam_rotation);
				gctx->ch1.img = load_texture("res/img/tokyo.jpg", gctx->ch1.img);
				gctx->cam.fov = glm_rad(100);
				gctx->cam.cam_rotation[1] = 2;
				gctx->ch1.crop.top = 32;
				gctx->ch1.crop.bot = 39;
				gctx->ch1.crop.left = 63;
				gctx->ch1.crop.right = 17;
				gctx->ch1.fov_deg = 306;
			}
			nk_tree_pop(ctx);
		}
		if (nk_tree_push(ctx, NK_TREE_TAB, "Load Image from device", NK_MAXIMIZED))
		{
			nk_style_set_font(ctx, gctx->std.handle);
			nk_layout_row_dynamic(ctx, 18 * gctx->interface_mult, 1);
			nk_label(ctx, "Load Mirror ball as a photo, only JPEG or PNG!", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "(iPhones default to shooting .HEIC, please", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "convert or change to JPG in system settings)", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "Doesn't seem to work on iPhones yet :[", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "Android and Computers are fine...", NK_TEXT_ALIGN_LEFT);
			nk_style_set_font(ctx, gctx->icons.handle);
			nk_layout_row_dynamic(ctx, 64 * gctx->interface_mult, 1);
			ctx->style.button.text_normal = nk_rgb(8, 166, 142);
			ctx->style.button.text_hover = nk_rgb(8, 166, 142);
			ctx->style.button.text_active = nk_rgb(8, 166, 142);
			if (nk_button_label(ctx, ""))
			{
				/* NON BLOCKING! */
				EM_ASM(
					var file_selector = document.createElement('input');
					file_selector.setAttribute('type', 'file');
					file_selector.setAttribute('onchange', 'open_file(event)');
					file_selector.setAttribute('accept', '.png,.jpeg'); // optional - limit accepted file types
					file_selector.click(););
			}

			nk_tree_pop(ctx);
		}
		/* Cropping */
		nk_style_set_font(ctx, gctx->big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 1);
		nk_label(ctx, "Cropping", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx->interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx->std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx->interface_mult, 1);
		nk_label(ctx, "Crop the image to the mirror ball's edge", NK_TEXT_ALIGN_LEFT);
		nk_property_int(ctx, "Top [px]", 0, &gctx->ch1.crop.top, gctx->ch1.img.h / 2, 1, 4);
		nk_property_int(ctx, "Bottom [px]", 0, &gctx->ch1.crop.bot, gctx->ch1.img.h / 2, 1, 4);
		nk_property_int(ctx, "Left [px]", 0, &gctx->ch1.crop.left, gctx->ch1.img.w / 2, 1, 4);
		nk_property_int(ctx, "Right [px]", 0, &gctx->ch1.crop.right, gctx->ch1.img.w / 2, 1, 4);

		/* Distortion Correction */
		nk_style_set_font(ctx, gctx->big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 1);
		nk_label(ctx, "Distortion Correction", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx->interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx->std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx->interface_mult, 1);
		nk_label(ctx, "For correcting distortion at the pole-point", NK_TEXT_ALIGN_LEFT);

		nk_property_float(ctx, "Sphere's field of view [in °]", 180, &gctx->ch1.fov_deg, 360, 1, 1);
		gctx->ch1.fov = 1.0 / sin(glm_rad(gctx->ch1.fov_deg) / 4.0);

		/* World rotation */
		nk_style_set_font(ctx, gctx->big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx->interface_mult, 1);
		nk_label(ctx, "World Rotation", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx->interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx->std.handle);
		nk_layout_row_dynamic(ctx, 20 * gctx->interface_mult, 1);
		nk_label(ctx, "If the mirror ball was captured not at horizon level,", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "correct it here, or camera control will be strange.", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 30 * gctx->interface_mult, 1);
		gctx->ch1.rotation[0] = glm_rad(nk_propertyf(ctx, "Pitch [offset in °]", -180, glm_deg(gctx->ch1.rotation[0]), 180, 1, 1));
		gctx->ch1.rotation[1] = glm_rad(nk_propertyf(ctx, "Yaw [offset in °]", -180, glm_deg(gctx->ch1.rotation[1]), 180, 1, 1));
		gctx->ch1.rotation[2] = glm_rad(nk_propertyf(ctx, "Roll [offset in °]", -180, glm_deg(gctx->ch1.rotation[2]), 180, 1, 1));

		/* Reset to standard Font */
		nk_style_set_font(ctx, gctx->std.handle);
	}
	nk_end(ctx);

	/* Update Camera */
	mat4 basis;
	mat4 eulerangles;
	glm_mat4_identity(basis);
	glm_euler_zyx(gctx->cam.cam_rotation, gctx->cam.cam_rotation_matrix);
	glm_euler_zyx(gctx->ch1.rotation, eulerangles);
	glm_mat4_mul(basis, eulerangles, basis);
	glm_mat4_mul(basis, gctx->cam.cam_rotation_matrix, basis);
	glm_mat4_copy(basis, gctx->cam.cam_rotation_matrix);
	glm_mat4_identity(gctx->cam.view_matrix);
	glm_translate(gctx->cam.view_matrix, (vec3){0.0, 0.0, 0.0});
	glm_mul_rot(gctx->cam.view_matrix, gctx->cam.cam_rotation_matrix, gctx->cam.view_matrix);
	glm_inv_tr(gctx->cam.view_matrix);
	glm_perspective(gctx->cam.fov, (float)win_width / (float)win_height, 0.01f, 100.0f, gctx->cam.projection_matrix);

	/* Update View-Rays */
	double distance = -0.5 / tan(gctx->cam.fov / 2.0);
	for (int i = 0; i < 4 * 5; i += 5)
	{
		viewrays[i + 4] = distance;
		viewrays[i + 2] = viewrays[i] * 0.5 * (float)win_width / (float)win_height;
		viewrays[i + 3] = viewrays[i + 1] * 0.5;
		glm_vec3_rotate_m4(gctx->cam.cam_rotation_matrix, &viewrays[i + 2], &viewrays[i + 2]);
	}

	/* Drawcalls */
	if (!gctx->projection)
	{
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx->ch1.img.tex);
		glUseProgram(gctx->crop_shader.shader);
		vec4 crop;
		int postcrop_w = gctx->ch1.img.w - (gctx->ch1.crop.left + gctx->ch1.crop.right);
		int postcrop_h = gctx->ch1.img.h - (gctx->ch1.crop.top + gctx->ch1.crop.bot);
		crop[0] = (1.0 / gctx->ch1.img.w) * gctx->ch1.crop.left;
		crop[1] = (1.0 / gctx->ch1.img.h) * gctx->ch1.crop.top;
		crop[2] = (1.0 / gctx->ch1.img.w) * postcrop_w;
		crop[3] = (1.0 / gctx->ch1.img.h) * postcrop_h;
		glUniform4fv(gctx->crop_shader.crop, 1, &crop[0]);

		glBindBuffer(GL_ARRAY_BUFFER, gctx->bgvbo);
		glVertexAttribPointer(gctx->crop_shader.pos, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), 0);
		glVertexAttribPointer(gctx->crop_shader.coord, 2, GL_FLOAT, GL_FALSE,
							  4 * sizeof(float), (void *)(2 * sizeof(float)));

		if (((float)postcrop_h / (float)postcrop_w) >
			((float)win_height / (float)win_width))
		{
			glUniform1f(gctx->crop_shader.aspect_h, 1.0);
			glUniform1f(gctx->crop_shader.aspect_w,
						((float)postcrop_w / (float)postcrop_h) /
							((float)win_width / (float)win_height));
		}
		else
		{
			glUniform1f(gctx->crop_shader.aspect_h,
						((float)postcrop_h / (float)postcrop_w) /
							((float)win_height / (float)win_width));
			glUniform1f(gctx->crop_shader.aspect_w, 1.0);
		}
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);
	}
	else
	{
		vec4 crop;
		crop[0] = (1.0 / gctx->ch1.img.w) * (gctx->ch1.img.w / 2.0 + gctx->ch1.crop.left / 2.0 - gctx->ch1.crop.right / 2.0);
		crop[1] = (1.0 / gctx->ch1.img.h) * (gctx->ch1.img.h / 2.0 + gctx->ch1.crop.top / 2.0 - gctx->ch1.crop.bot / 2.0);
		crop[2] = (1.0 / gctx->ch1.img.w) * (gctx->ch1.img.w - gctx->ch1.crop.left / 1.0 - gctx->ch1.crop.right / 1.0);
		crop[3] = (1.0 / gctx->ch1.img.h) * (gctx->ch1.img.h - gctx->ch1.crop.top / 1.0 - gctx->ch1.crop.bot / 1.0);
		glUseProgram(gctx->projection_shader.shader);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx->ch1.img.tex);
		glEnableVertexAttribArray(gctx->projection_shader.pos);
		glEnableVertexAttribArray(gctx->projection_shader.viewray);
		glUniform4fv(gctx->projection_shader.crop, 1, crop);
		glBindBuffer(GL_ARRAY_BUFFER, gctx->rayvbo);
		glBufferData(GL_ARRAY_BUFFER, sizeof(viewrays), viewrays, GL_DYNAMIC_DRAW);
		glVertexAttribPointer(gctx->projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), 0);
		glVertexAttribPointer(gctx->projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), (void *)(2 * sizeof(float)));
		glUniform1f(gctx->projection_shader.scaler, gctx->ch1.fov);
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glDisableVertexAttribArray(gctx->projection_shader.pos);
		glDisableVertexAttribArray(gctx->projection_shader.viewray);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);
	}

	const int MAX_VERTEX_MEMORY = 512 * 1024;
	const int MAX_ELEMENT_MEMORY = 128 * 1024;

	nk_sdl_render(NK_ANTI_ALIASING_ON, MAX_VERTEX_MEMORY, MAX_ELEMENT_MEMORY);
	SDL_GL_SwapWindow(gctx->win);
}