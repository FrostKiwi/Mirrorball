#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <inttypes.h>
#define _USE_MATH_DEFINES
#include <math.h>
#include "res.h"
#define VLAD_STD
#define VLAD_OPENGL
#include "Vlad.h"
#include "GL/glew.h"
#include <GLFW/glfw3.h>
#include "nfd.h"
#define NK_INCLUDE_FIXED_TYPES
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#define NK_KEYSTATE_BASED_INPUT
#include "nuklear.h"
#include "nuklear_glfw_gl3.h"
#include "cglm/cglm.h"
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>

// print out the steps and errors
static void logging(const char *fmt, ...);
// decode packets into frames
static int decode_packet(AVPacket *pPacket, AVCodecContext *pCodecContext, AVFrame *pFrame);



static void logging(const char *fmt, ...)
{
    /* va_list args; */
    /* fprintf( stderr, "LOG: " ); */
    /* va_start( args, fmt ); */
    /* vfprintf( stderr, fmt, args ); */
    /* va_end( args ); */
    /* fprintf( stderr, "\n" ); */
}

/* Global state */
struct{
    GLFWwindow* window;
    int window_w;
    int window_h;
    int nk_max_vertex_buffer;
    int nk_max_element_buffer;
    vec3 camera_rotation;
    mat4 camera_rotation_matrix;
    mat4 view_matrix;
    mat4 projection_matrix;
    float fov;
    float fovmin;
    float fovmax;
}gctx = {
    /* Some defaults */
    .window_w = 1000,
    .window_h = 800,
    .nk_max_vertex_buffer = 512 * 1024,
    .nk_max_element_buffer = 128 * 1024,
};

/* Some structs to organize data */
struct crop_rect {
    int top;
    int bot;
    int left;
    int right;
};
struct channel {
    bool enabled;
    GLuint tex;
    GLuint tex_Y;
    GLuint tex_U;
    GLuint tex_V;
    int width;
    int height;
    int color_depth;
    struct crop_rect crop;
    vec3 world_rotation;
    float sphere_fov;
    float sphere_fov_deg;
    struct{
	GLuint shader;
	GLint aspect_w;
	GLint aspect_h;	
	GLint crop;
    }crop_shader;
    struct {
	GLuint shader;
	GLint pos;
	GLint viewray;
	GLint crop;
	GLint scaler;
    }projection_shader;

    /* Video struct */
    bool video;
    AVFrame *pFrame;
    AVPacket *pPacket;
    AVCodecContext *pCodecContext;
    AVFormatContext *pFormatContext;
    AVCodec *pCodec;
    AVCodecParameters *pCodecParameters;
    AVCodecParameters *pLocalCodecParameters;
    AVCodec *pLocalCodec;
    int video_stream_index;
    struct {
	GLuint shader;
	GLint aspect_w;
	GLint aspect_h;	
	GLint crop;
    }vid_crop_shader;
    struct {
	GLuint shader;
	GLint pos;
	GLint viewray;
	GLint crop;
	GLint scaler;
    }vid_projection_shader;
};

void fetch_frame(struct channel *ch)
{
    av_read_frame(ch->pFormatContext, ch->pPacket);

    // if it's the video stream
    if (ch->pPacket->stream_index == ch->video_stream_index) {
	logging("AVPacket->pts %" PRId64, ch->pPacket->pts);
		
	int response = avcodec_send_packet(ch->pCodecContext, ch->pPacket);

	if (response < 0) {
	    logging("Error while sending a packet to the decoder: %s", av_err2str(response));
	}

	while (response >= 0)
	    {
		// Return decoded output data (into a frame) from a decoder
		// https://ffmpeg.org/doxygen/trunk/group__lavc__decoding.html#ga11e6542c4e66d3028668788a1a74217c
		response = avcodec_receive_frame(ch->pCodecContext, ch->pFrame);

		if (response == AVERROR(EAGAIN) || response == AVERROR_EOF) {
		    break;
		} else if (response < 0) {
		    logging("Error while receiving a frame from the decoder: %s", av_err2str(response));
		}

		if (response >= 0) {
		    logging(
			"Frame %d (type=%c, size=%d bytes, format=%d) pts %d key_frame %d [DTS %d]",
			ch->pCodecContext->frame_number,
			av_get_picture_type_char(ch->pFrame->pict_type),
			ch->pFrame->pkt_size,
			ch->pFrame->format,
			ch->pFrame->pts,
			ch->pFrame->key_frame,
			ch->pFrame->coded_picture_number
			);

		    // Check if the frame is a planar YUV 4:2:0, 12bpp
		    // That is the format of the provided .mp4 file
		    // RGB formats will definitely not give a gray image
		    // Other YUV image may do so, but untested, so give a warning
		    glActiveTexture(GL_TEXTURE0);
		    glBindTexture(GL_TEXTURE_2D, ch->tex_Y);
		    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, ch->width, ch->height, GL_RED,
				    GL_UNSIGNED_BYTE, ch->pFrame->data[0]);

		    glActiveTexture(GL_TEXTURE1);
		    glBindTexture(GL_TEXTURE_2D, ch->tex_U);
		    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, ch->width/2, ch->height/2, GL_RED,
				    GL_UNSIGNED_BYTE, ch->pFrame->data[1]);

		    glActiveTexture(GL_TEXTURE2);
		    glBindTexture(GL_TEXTURE_2D, ch->tex_V);
		    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, ch->width/2, ch->height/2, GL_RED,
				    GL_UNSIGNED_BYTE, ch->pFrame->data[2]);
		}
	    }
	// https://ffmpeg.org/doxygen/trunk/group__lavc__packet.html#ga63d5a489b419bd5d45cfd09091cbcbc2
    }
    av_packet_unref(ch->pPacket);

    double fps = (double)(ch->pFormatContext->streams[ch->video_stream_index]->r_frame_rate.num)/
	(double)(ch->pFormatContext->streams[ch->video_stream_index]->r_frame_rate.den);
    double dur = (double)ch->pFormatContext->duration / (double)AV_TIME_BASE;
    dur = dur - 0.5;
    printf("%f, %f\n", fps, dur);
    if ((double)ch->pCodecContext->frame_number > (dur * fps) ) {
	av_seek_frame(ch->pFormatContext, ch->video_stream_index, 0, 0);
	ch->pCodecContext->frame_number = 0;
    }
}

bool load_channel_image(struct channel *ch)
{
    nfdchar_t *outPath;
    nfdfilteritem_t filterItem[1] = { { "Images", "jpg,jpeg,png,bmp,psd,tga,gif,hdr,pic,ppm,pgm" } };
    nfdresult_t result = NFD_OpenDialog(&outPath, filterItem, 1, NULL);
    if (result == NFD_OKAY){
	unsigned char * imgdata = stbi_load(outPath, &ch->width, &ch->height, &ch->color_depth, 3);
	glDeleteTextures(1, &ch->tex);
	glGenTextures(1, &ch->tex);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, ch->tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,
			GL_CLAMP_TO_EDGE); 
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,
			GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER,
			GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER,
			GL_LINEAR);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, ch->width,
		     ch->height, 0, GL_RGB, GL_UNSIGNED_BYTE,
		     imgdata);
	stbi_image_free(imgdata);
	NFD_FreePath(outPath);
	return true;
    }
    else if (result == NFD_CANCEL){
	puts("User pressed cancel.");
	return false;
    }
    else {
	printf("Error: %s\n", NFD_GetError());
	puts(TXT_RED "Error when opening a file, aborting!" TXT_OFF);
	return false;
    }
}

bool load_channel_video(struct channel *ch)
{
    avformat_close_input(&ch->pFormatContext);
    av_packet_free(&ch->pPacket);
    av_frame_free(&ch->pFrame);
    avcodec_free_context(&ch->pCodecContext);
    
    nfdchar_t *outPath;
    nfdfilteritem_t filterItem[2] = { { "Videos", "mp4,m4v,avi,mov" }, {"All Files", "*" } };
    nfdresult_t result = NFD_OpenDialog(&outPath, filterItem, 2, NULL);
    if (result == NFD_OKAY){

	    // Allocating memory for this component
	    // http://ffmpeg.org/doxygen/trunk/structAVFormatContext.html
	    ch->pFormatContext = avformat_alloc_context();
	if (!ch->pFormatContext) {
	    logging("ERROR could not allocate memory for Format Context");
	    return -1;
	}

	logging("opening the input file (%s) and loading format (container) header", outPath);
	// Open the file and read its header. The codecs are not opened.
	// The function arguments are:
	// AVFormatContext (the component we allocated memory for),
	// url (filename),
	// AVInputFormat (if you pass NULL it'll do the auto detect)
	// and AVDictionary (which are options to the demuxer)
	// http://ffmpeg.org/doxygen/trunk/group__lavf__decoding.html#ga31d601155e9035d5b0e7efedc894ee49
	if (avformat_open_input(&ch->pFormatContext, outPath, NULL, NULL) != 0) {
	    logging("ERROR could not open the file");
	    return -1;
	}

	// now we have access to some information about our file
	// since we read its header we can say what format (container) it's
	// and some other information related to the format itself.
	logging("format %s, duration %lld us, bit_rate %lld", ch->pFormatContext->iformat->name, ch->pFormatContext->duration, ch->pFormatContext->bit_rate);

	logging("finding stream info from format");
	// read Packets from the Format to get stream information
	// this function populates pFormatContext->streams
	// (of size equals to pFormatContext->nb_streams)
	// the arguments are:
	// the AVFormatContext
	// and options contains options for codec corresponding to i-th stream.
	// On return each dictionary will be filled with options that were not found.
	// https://ffmpeg.org/doxygen/trunk/group__lavf__decoding.html#gad42172e27cddafb81096939783b157bb
	if (avformat_find_stream_info(ch->pFormatContext,  NULL) < 0) {
	    logging("ERROR could not get the stream info");
	    return -1;
	}

	// the component that knows how to enCOde and DECode the stream
	// it's the codec (audio or video)
	// http://ffmpeg.org/doxygen/trunk/structAVCodec.html
	ch->pCodec = NULL;
	// this component describes the properties of a codec used by the stream i
	// https://ffmpeg.org/doxygen/trunk/structAVCodecParameters.html
	ch->pCodecParameters =  NULL;
	ch->video_stream_index = -1;

	// loop though all the streams and print its main information
	for (int i = 0; i < ch->pFormatContext->nb_streams; i++)
	    {
		ch->pLocalCodecParameters =  NULL;
		ch->pLocalCodecParameters = ch->pFormatContext->streams[i]->codecpar;
		logging("AVStream->time_base before open coded %d/%d", ch->pFormatContext->streams[i]->time_base.num, ch->pFormatContext->streams[i]->time_base.den);
		logging("AVStream->r_frame_rate before open coded %d/%d", ch->pFormatContext->streams[i]->r_frame_rate.num, ch->pFormatContext->streams[i]->r_frame_rate.den);
		logging("AVStream->start_time %" PRId64, ch->pFormatContext->streams[i]->start_time);
		logging("AVStream->duration %" PRId64, ch->pFormatContext->streams[i]->duration);

		logging("finding the proper decoder (CODEC)");

		ch->pLocalCodec = NULL;

		// finds the registered decoder for a codec ID
		// https://ffmpeg.org/doxygen/trunk/group__lavc__decoding.html#ga19a0ca553277f019dd5b0fec6e1f9dca
		ch->pLocalCodec = avcodec_find_decoder(ch->pLocalCodecParameters->codec_id);

		if (ch->pLocalCodec==NULL) {
		    logging("ERROR unsupported codec!");
		    // In this example if the codec is not found we just skip it
		    continue;
		}

		// when the stream is a video we store its index, codec parameters and codec
		if (ch->pLocalCodecParameters->codec_type == AVMEDIA_TYPE_VIDEO) {
		    if (ch->video_stream_index == -1) {
			ch->video_stream_index = i;
			ch->pCodec = ch->pLocalCodec;
			ch->pCodecParameters = ch->pLocalCodecParameters;
		    }

		    logging("Video Codec: resolution %d x %d", ch->pLocalCodecParameters->width, ch->pLocalCodecParameters->height);
		} else if (ch->pLocalCodecParameters->codec_type == AVMEDIA_TYPE_AUDIO) {
		    logging("Audio Codec: %d channels, sample rate %d", ch->pLocalCodecParameters->channels, ch->pLocalCodecParameters->sample_rate);
		}

		// print its name, id and bitrate
		logging("\tCodec %s ID %d bit_rate %lld", ch->pLocalCodec->name, ch->pLocalCodec->id, ch->pLocalCodecParameters->bit_rate);
	    }

	if (ch->video_stream_index == -1) {
	    logging("File %s does not contain a video stream!", outPath);
	    return -1;
	}

	// https://ffmpeg.org/doxygen/trunk/structAVCodecContext.html
	ch->pCodecContext = avcodec_alloc_context3(ch->pCodec);
	if (!ch->pCodecContext)
	    {
		logging("failed to allocated memory for AVCodecContext");
		return -1;
	    }

	// Fill the codec context based on the values from the supplied codec parameters
	// https://ffmpeg.org/doxygen/trunk/group__lavc__core.html#gac7b282f51540ca7a99416a3ba6ee0d16
	if (avcodec_parameters_to_context(ch->pCodecContext, ch->pCodecParameters) < 0)
	    {
		logging("failed to copy codec params to codec context");
		return -1;
	    }

	// Initialize the AVCodecContext to use the given AVCodec.
	// https://ffmpeg.org/doxygen/trunk/group__lavc__core.html#ga11f785a188d7d9df71621001465b0f1d
	ch->pCodecContext->thread_count = 8;
	ch->pCodecContext->thread_type = FF_THREAD_FRAME;
	if (avcodec_open2(ch->pCodecContext, ch->pCodec, NULL) < 0)
	    {
		logging("failed to open codec through avcodec_open2");
		return -1;
	    }

	// https://ffmpeg.org/doxygen/trunk/structAVFrame.html
	ch->pFrame = av_frame_alloc();
	if (!ch->pFrame)
	    {
		logging("failed to allocate memory for AVFrame");
		return -1;
	    }
	// https://ffmpeg.org/doxygen/trunk/structAVPacket.html
	ch->pPacket = av_packet_alloc();
	if (!ch->pPacket)
	    {
		logging("failed to allocate memory for AVPacket");
		return -1;
	    }

	/* int response = 0; */
	/* int how_many_packets_to_process = 8; */

	// fill the Packet with data from the Stream
	// https://ffmpeg.org/doxygen/trunk/group__lavf__decoding.html#ga4fdb3084415a82e3810de6ee60e46a61
	/* int outer_response = 0; */
	/* while (av_read_frame(ch->pFormatContext, pPacket) >= 0) */
	/*     { */
	/* 	// if it's the video stream */
	/* 	if (pPacket->stream_index == video_stream_index) { */
	/* 	    logging("AVPacket->pts %" PRId64, pPacket->pts); */
	/* 	    outer_response = decode_packet(pPacket, ch->pCodecContext, ch->pFrame); */
	/* 	    if (outer_response < 0) */
	/* 		break; */
	/* 	} */
	/* 	// https://ffmpeg.org/doxygen/trunk/group__lavc__packet.html#ga63d5a489b419bd5d45cfd09091cbcbc2 */
	/* 	av_packet_unref(pPacket); */
	/*     } */

	ch->width = ch->pLocalCodecParameters->width; 
	ch->height = ch->pLocalCodecParameters->height;
	glDeleteTextures(1, &ch->tex_Y);
	glGenTextures(1, &ch->tex_Y);
	glBindTexture(GL_TEXTURE_2D, ch->tex_Y);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, ch->width, ch->height, 0, GL_RED, GL_UNSIGNED_BYTE, NULL);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	glDeleteTextures(1, &ch->tex_U);
	glGenTextures(1, &ch->tex_U);
	glBindTexture(GL_TEXTURE_2D, ch->tex_U);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, ch->width/2, ch->height/2, 0, GL_RED, GL_UNSIGNED_BYTE, NULL);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	glDeleteTextures(1, &ch->tex_V);
	glGenTextures(1, &ch->tex_V);
	glBindTexture(GL_TEXTURE_2D, ch->tex_V);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, ch->width/2, ch->height/2, 0, GL_RED, GL_UNSIGNED_BYTE, NULL);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	NFD_FreePath(outPath);
	return true;
    }
    else if (result == NFD_CANCEL){
	puts("User pressed cancel.");
	return false;
    }
    else {
	printf("Error: %s\n", NFD_GetError());
	puts(TXT_RED "Error when opening a file, aborting!" TXT_OFF);
	return false;
    }
}

static void error_callback(int e, const char *d)
{
    if(e != 65548)		/* Ignore the Wayland window size error */
	printf("\033[31mError %d: %s\033[0m\n", e, d);
}

static void keypress(GLFWwindow* win, int key, int scancode, int act, int mod)  
{
    /* Escape to close */
    if (key == GLFW_KEY_ESCAPE && act == GLFW_PRESS)
	glfwSetWindowShouldClose(win, GLFW_TRUE);
}

void load_icons(GLFWwindow * window)
{
    GLFWimage images[3];
    images[0].pixels = stbi_load_from_memory((void *)icon48_png.pnt, icon48_png.size, &images[0].width, &images[0].height, NULL, 4);
    images[1].pixels = stbi_load_from_memory((void *)icon32_png.pnt, icon32_png.size, &images[1].width, &images[1].height, NULL, 4);
    images[2].pixels = stbi_load_from_memory((void *)icon16_png.pnt, icon16_png.size, &images[2].width, &images[2].height, NULL, 4);
    glfwSetWindowIcon(window, 3, images);
    stbi_image_free(images[0].pixels);
    stbi_image_free(images[1].pixels);
    stbi_image_free(images[2].pixels);
}

int init(){
    /* Setup GLEW and GLFW */
    glfwSetErrorCallback(error_callback);
    if ( !glfwInit() ) {
	puts(TXT_RED "GLFW could not init." TXT_OFF);	
	return -1;
    }
    glfwWindowHint(GLFW_TRANSPARENT_FRAMEBUFFER, GLFW_TRUE);
    gctx.window = glfwCreateWindow(gctx.window_w, gctx.window_h, "Frostorama",
				   NULL, NULL);
    if ( gctx.window == NULL) {
	puts("GLFW couldn't create a window.");
	return -1;
    }
    load_icons(gctx.window);
    glfwMakeContextCurrent(gctx.window);
    glfwSetKeyCallback(gctx.window, keypress);
    glfwSwapInterval(1);
    glewInit();
    glPointSize(20);

    /* Some basic OpenGL Settings */
    print_glinfo();

    glClearColor(0, 0, 0, 0);
    /* Prevents headaches when loading NPOT textures */
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glPixelStorei(GL_PACK_ALIGNMENT, 1);

    /* Reset camera */
    gctx.fov = glm_rad(90);
    gctx.fovmin = glm_rad(10);
    gctx.fovmax = glm_rad(130);
    glm_vec3_zero(gctx.camera_rotation);

    /* Debug messages */
    glEnable(GL_DEBUG_OUTPUT);
    glDebugMessageCallback(gl_debug_callback, NULL);

    NFD_Init();
    return 0;
}

int main(void){
    if (init() != 0) {
	puts(TXT_RED "Something went wrong, aborting!" TXT_OFF);
	return -1;
    }

    /* Init GUI */
    struct nk_glfw glfw = {0};
    struct nk_context *ctx = nk_glfw3_init(&glfw, gctx.window, NK_GLFW3_INSTALL_CALLBACKS);
    struct nk_style_button buttonstock = ctx->style.button;
    struct nk_style_button buttongreen = ctx->style.button;
    buttongreen.text_normal = nk_rgb(8, 166, 142);
    buttongreen.text_hover = nk_rgb(8, 166, 142);
    buttongreen.text_active = nk_rgb(8, 166, 142);

    /* Fonts */
    struct nk_font * icons, * small, * big;
       
    struct nk_font_config cfg_icon = nk_font_config(0);
    struct nk_font_config cfg_font = nk_font_config(0);
    struct nk_font_config cfg_big = nk_font_config(0);
    cfg_icon.oversample_h = cfg_icon.oversample_v = 1;
    cfg_font.oversample_h = cfg_font.oversample_v = 1;
    cfg_big.oversample_h = cfg_big.oversample_v = 1;
    cfg_icon.pixel_snap = true;
    cfg_font.pixel_snap = true;
    cfg_big.pixel_snap = true;
    nk_rune ranges_icon[] = {
	0xF07C, 0xF07C, 	/*  */
	0xF083, 0xF083,		/*  */
	0xF0AD, 0xF0AD,		/*  */
	0xF021, 0xF021,		/*  */
	0xF1C5, 0xF1C5,		/*  */
	0xF1C8, 0xF1C8,		/*  */
	0
    };
    nk_rune ranges_font[] = {
	0x0020, 0x007E,		/* Ascii */
	0x00A1, 0x00FF,		/* Symbols + Umlaute */
	0
    };
    cfg_icon.range = ranges_icon;
    cfg_font.range = ranges_font;
    struct nk_font_atlas *atlas;
    nk_glfw3_font_stash_begin(&glfw, &atlas);
    icons = nk_font_atlas_add_from_memory(atlas, (void *)icons_ttf.pnt,
					  icons_ttf.size, 46, &cfg_icon);
    small = nk_font_atlas_add_from_memory(atlas, (void *)roboto_ttf.pnt,
					  roboto_ttf.size, 22, &cfg_font);
    big = nk_font_atlas_add_from_memory(atlas, (void *)roboto_ttf.pnt,
					roboto_ttf.size, 32, &cfg_font);
    nk_glfw3_font_stash_end(&glfw);
    
    nk_style_set_font(ctx, &small->handle);

    /* Local Variables for the render loop */
    struct channel ch1 = {.sphere_fov = 1.0};
    bool projection = false; 	/* Switch between projection an cropping mode */
    GLuint viewrays_vbo;
    float mult; 		/* Input multiplier for faster navigation */
    glGenBuffers(1, &viewrays_vbo);

    float viewrays[] = {
	-1.0,  1.0, 0.0, 0.0, 0.0,
	1.0,  1.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 0.0, 0.0, 0.0,
	-1.0, -1.0, 0.0, 0.0, 0.0
    };

    /* Gamepad Check */
    GLFWgamepadstate state;
    if (glfwGetGamepadState(GLFW_JOYSTICK_1, &state))
	printf("Gamepad | %s\n", glfwGetGamepadName(GLFW_JOYSTICK_1));

    /* Renderloop */
    while (!glfwWindowShouldClose(gctx.window)) {
	glfwPollEvents();

	/* Handle 3D Inputs synchronously */
	if( glfwGetKey(gctx.window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS)
	    mult = 3.0; else mult = 1.0;
	if( glfwGetKey(gctx.window, GLFW_KEY_1) == GLFW_PRESS){
	    ch1.sphere_fov-= 0.0001 * mult;
	    if(ch1.sphere_fov< 0.0) ch1.sphere_fov= 1.0;
	}
	else if( glfwGetKey(gctx.window, GLFW_KEY_2) == GLFW_PRESS){
	    ch1.sphere_fov+= 0.0001 * mult;
	}
      
	/* Handle Gamepad state */
	if (glfwGetGamepadState(GLFW_JOYSTICK_1, &state)){
	    /* Pitch */
	    if(fabsf(state.axes[GLFW_GAMEPAD_AXIS_LEFT_Y]) > 0.19)
		gctx.camera_rotation[0] -= (state.axes[GLFW_GAMEPAD_AXIS_LEFT_Y])*0.03;
	    if(gctx.camera_rotation[0] > M_PI / 2.0) gctx.camera_rotation[0] = M_PI / 2.0;
	    if(gctx.camera_rotation[0] < M_PI / -2.0) gctx.camera_rotation[0] = M_PI / -2.0;
	    /* Yaw  */
	    if(fabsf(state.axes[GLFW_GAMEPAD_AXIS_LEFT_X]) > 0.333)
		gctx.camera_rotation[1] -= (state.axes[GLFW_GAMEPAD_AXIS_LEFT_X])*0.03;
	    /* Zoom */
	    if(fabsf(state.axes[GLFW_GAMEPAD_AXIS_RIGHT_Y]) > 0.19)
		gctx.fov += state.axes[GLFW_GAMEPAD_AXIS_RIGHT_Y]*0.025;
	}
	if(gctx.fov <= gctx.fovmin) gctx.fov = gctx.fovmin;
	if(gctx.fov > gctx.fovmax) gctx.fov = gctx.fovmax;
      
	/* Reset frame */
	glfwGetWindowSize(gctx.window, &gctx.window_w, &gctx.window_h);
	glViewport(0, 0, gctx.window_w, gctx.window_h);
	glClear(GL_COLOR_BUFFER_BIT);

	/* Build GUI */
	nk_glfw3_new_frame(&glfw);

	if (nk_begin(ctx, "Frostorama", nk_rect(50, 50, 400, 650),
		     NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE |
		     NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE)) {
	    ctx->style.button = buttonstock;
	    nk_layout_row_dynamic(ctx, 32, 1);
	    nk_style_set_font(ctx, &small->handle);
	    if (nk_button_label(ctx, "Reset camera rotation")) {
		glm_vec3_zero(gctx.camera_rotation);
	    }
	    if (nk_option_label(ctx, "Crop image", !projection)) projection = false;
	    if (nk_option_label(ctx, "Project image", projection)) projection = true;
	    
	    /* Image Channls */
	    if (nk_tree_push(ctx, NK_TREE_TAB, "Image Channel 1", NK_MAXIMIZED)) {
		/* Input */
		nk_style_set_font(ctx, &big->handle);
		nk_layout_row_dynamic(ctx, 32, 1);
		nk_label(ctx, "Input", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);
		nk_style_set_font(ctx, &small->handle);
		nk_layout_row_dynamic(ctx, 24, 1);
		nk_label_wrap(ctx, "Mirror ball as a photo, video or via capture card");
		nk_style_set_font(ctx, &icons->handle);
		ctx->style.button = buttongreen;
		nk_layout_row_dynamic(ctx, 52, 3);
		if (nk_button_label(ctx, "")) {
		    if (load_channel_image(&ch1)) {
			ch1.enabled = true;
			ch1.video = false;
			ch1.crop_shader.shader =
			    compile_shader(photo_crop_vert.pnt, photo_crop_vert.size,
					   photo_crop_frag.pnt, photo_crop_frag.size);
			ch1.crop_shader.aspect_w = glGetUniformLocation(ch1.crop_shader.shader, "aspect_w");
			ch1.crop_shader.aspect_h = glGetUniformLocation(ch1.crop_shader.shader, "aspect_h");
			ch1.crop_shader.crop = glGetUniformLocation(ch1.crop_shader.shader, "crop");
			ch1.crop = (struct crop_rect){0};
			ch1.sphere_fov_deg = 360;

			ch1.projection_shader.shader =
			    compile_shader(photo_projection_vert.pnt, photo_projection_vert.size,
					   photo_projection_frag.pnt, photo_projection_frag.size);
			ch1.projection_shader.pos = glGetAttribLocation(ch1.projection_shader.shader, "pos");
			ch1.projection_shader.viewray = glGetAttribLocation(ch1.projection_shader.shader, "rayvtx");
			ch1.projection_shader.scaler = glGetUniformLocation(ch1.projection_shader.shader, "scalar");
			ch1.projection_shader.crop = glGetUniformLocation(ch1.projection_shader.shader, "crop");
		    }
		}
		if (nk_button_label(ctx, "")) {
		    if (load_channel_video(&ch1)) {
			ch1.video = true;
			ch1.enabled = true;
			ch1.vid_crop_shader.shader =
			    compile_shader(video_crop_vert.pnt, video_crop_vert.size,
					   video_crop_frag.pnt, video_crop_frag.size);
			ch1.vid_crop_shader.aspect_w = glGetUniformLocation(ch1.vid_crop_shader.shader, "aspect_w");
			ch1.vid_crop_shader.aspect_h = glGetUniformLocation(ch1.vid_crop_shader.shader, "aspect_h");
			ch1.vid_crop_shader.crop = glGetUniformLocation(ch1.vid_crop_shader.shader, "crop");
			ch1.crop = (struct crop_rect){0};
			ch1.sphere_fov_deg = 360;

			ch1.vid_projection_shader.shader =
			    compile_shader(video_projection_vert.pnt, video_projection_vert.size,
					   video_projection_frag.pnt, video_projection_frag.size);
			ch1.vid_projection_shader.pos = glGetAttribLocation(ch1.vid_projection_shader.shader, "pos");
			ch1.vid_projection_shader.viewray = glGetAttribLocation(ch1.vid_projection_shader.shader, "rayvtx");
			ch1.vid_projection_shader.scaler = glGetUniformLocation(ch1.vid_projection_shader.shader, "scalar");
			ch1.vid_projection_shader.crop = glGetUniformLocation(ch1.vid_projection_shader.shader, "crop");
		    }
		}
		if (nk_button_label(ctx, "")) {
		}

		/* Cropping */
		nk_style_set_font(ctx, &big->handle);
		nk_layout_row_dynamic(ctx, 32, 1);
		nk_label(ctx, "Cropping", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, &small->handle);
		nk_layout_row_dynamic(ctx, 30, 1);
		nk_label(ctx, "Crop the image to the mirror ball edge", NK_TEXT_ALIGN_LEFT);
		nk_property_int(ctx, "Top [px]", 0, &ch1.crop.top, ch1.height/2, 1, 1);
		nk_property_int(ctx, "Bottom [px]", 0, &ch1.crop.bot, ch1.height/2, 1, 1);
		nk_property_int(ctx, "Left [px]", 0, &ch1.crop.left, ch1.width/2, 1, 1);
		nk_property_int(ctx, "Right [px]", 0, &ch1.crop.right, ch1.width/2, 1, 1);

		/* Distortion Correction */
		nk_style_set_font(ctx, &big->handle);
		nk_layout_row_dynamic(ctx, 32, 1);
		nk_label(ctx, "Distortion Correction", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, &small->handle);
		nk_layout_row_dynamic(ctx, 30, 1);
		nk_label(ctx, "For correcting distortion at the pole-point", NK_TEXT_ALIGN_LEFT);

		nk_property_float(ctx, "Sphere's field of view [in °]", 180, &ch1.sphere_fov_deg, 360, 1, 0.1);		
		ch1.sphere_fov = 1.0 / sin( glm_rad(ch1.sphere_fov_deg) / 4.0 );

		/* World rotation */
		nk_style_set_font(ctx, &big->handle);
		nk_layout_row_dynamic(ctx, 32, 1);
		nk_label(ctx, "World Rotation", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, &small->handle);
		nk_layout_row_dynamic(ctx, 30, 1);
		ch1.world_rotation[0] = glm_rad(nk_propertyf(ctx, "Pitch [offset in °]", -180, glm_deg(ch1.world_rotation[0]), 180, 1, 0.1));
		ch1.world_rotation[1] = glm_rad(nk_propertyf(ctx, "Yaw [offset in °]", -180, glm_deg(ch1.world_rotation[1]), 180, 1, 0.1));
		ch1.world_rotation[2] = glm_rad(nk_propertyf(ctx, "Roll [offset in °]", -180, glm_deg(ch1.world_rotation[2]), 180, 1, 0.1));

		/* Color correction */
		nk_style_set_font(ctx, &big->handle);
		nk_layout_row_dynamic(ctx, 32, 1);
		nk_label(ctx, "Color correction", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, &small->handle);
		nk_layout_row_dynamic(ctx, 30, 2);
		nk_label(ctx, "Saturation", NK_TEXT_CENTERED);
		nk_label(ctx, "Gamma", NK_TEXT_CENTERED);
		nk_tree_pop(ctx);
	    }
	}
	nk_end(ctx);

	/* Update Camera */
	mat4 basis;
	mat4 eulerangles;
	glm_mat4_identity(basis);
	glm_euler_zyx(gctx.camera_rotation, gctx.camera_rotation_matrix);
	glm_euler_zyx(ch1.world_rotation, eulerangles);
	glm_mat4_mul(basis, eulerangles, basis);
	glm_mat4_mul(basis, gctx.camera_rotation_matrix, basis);
	glm_mat4_copy(basis, gctx.camera_rotation_matrix);
	glm_mat4_identity(gctx.view_matrix);
	glm_translate(gctx.view_matrix, (vec3){0.0, 0.0, 0.0});
	glm_mul_rot(gctx.view_matrix, gctx.camera_rotation_matrix, gctx.view_matrix);
	glm_inv_tr(gctx.view_matrix);
	glm_perspective(gctx.fov, (float)gctx.window_w/(float)gctx.window_h, 0.01f, 100.0f, gctx.projection_matrix);

	/* Update View-Rays */
	double distance = -0.5 / tan(gctx.fov/2.0);
	for(int i = 0; i < 4*5; i += 5){
	    viewrays[i+4] = distance;
	    viewrays[i+2] = viewrays[i] * 0.5 * (float)gctx.window_w/(float)gctx.window_h;
	    viewrays[i+3] = viewrays[i+1] * 0.5;
	    glm_vec3_rotate_m4(gctx.camera_rotation_matrix, &viewrays[i+2], &viewrays[i+2]);
	}

	/* Render */
	/* Channel 1 */
	if (ch1.enabled && !projection && !ch1.video) {
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, ch1.tex);
	    glUseProgram(ch1.crop_shader.shader);
	    glUniform1i(glGetUniformLocation(ch1.crop_shader.shader, "sample"), 0);
	    vec4 crop;
	    int postcrop_w = ch1.width - (ch1.crop.left + ch1.crop.right);
	    int postcrop_h = ch1.height - (ch1.crop.top + ch1.crop.bot);
	    crop[0] = (1.0 / ch1.width) * ch1.crop.left;
	    crop[1] = (1.0 / ch1.height) * ch1.crop.top;
	    crop[2] = (1.0 / ch1.width) * postcrop_w;
	    crop[3] = (1.0 / ch1.height) * postcrop_h;
	    glUniform4fv(ch1.crop_shader.crop, 1, &crop[0]);
	    if (((float)postcrop_h / (float)postcrop_w) >
		((float)gctx.window_h / (float)gctx.window_w)) {
		glUniform1f(ch1.crop_shader.aspect_h, 1.0);
		glUniform1f(ch1.crop_shader.aspect_w,
			    ((float)postcrop_w / (float)postcrop_h) /
			    ((float)gctx.window_w / (float)gctx.window_h));
	    } else {
		glUniform1f(ch1.crop_shader.aspect_h,
			    ((float)postcrop_h / (float)postcrop_w) /
			    ((float)gctx.window_h / (float)gctx.window_w));
		glUniform1f(ch1.crop_shader.aspect_w, 1.0);
	    }
	    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	    glUseProgram(0);
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, 0);
	}
	if (ch1.enabled && projection && !ch1.video) {
	    vec4 crop;
	    crop[0] = (1.0 / ch1.width) * (ch1.width / 2.0 + ch1.crop.left / 2.0 - ch1.crop.right / 2.0);
	    crop[1] = (1.0 / ch1.height) * (ch1.height / 2.0 + ch1.crop.top / 2.0 - ch1.crop.bot / 2.0);
	    crop[2] = (1.0 / ch1.width) * (ch1.width - ch1.crop.left / 1.0 - ch1.crop.right / 1.0);
	    crop[3] = (1.0 / ch1.height) * (ch1.height - ch1.crop.top / 1.0 - ch1.crop.bot / 1.0);
	    glUseProgram(ch1.projection_shader.shader);
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, ch1.tex);
	    glUniform1i(glGetUniformLocation(ch1.projection_shader.shader, "sample_projection"), 0);
	    glEnableVertexAttribArray(ch1.projection_shader.pos);
	    glEnableVertexAttribArray(ch1.projection_shader.viewray);
	    glUniform4fv(ch1.projection_shader.crop, 1, crop);
	    glBindBuffer(GL_ARRAY_BUFFER, viewrays_vbo);
	    glBufferData(GL_ARRAY_BUFFER, sizeof(viewrays), viewrays, GL_DYNAMIC_DRAW);
	    glVertexAttribPointer(ch1.projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
				  5*sizeof(float), 0);
	    glVertexAttribPointer(ch1.projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
				  5*sizeof(float), (void*)(2*sizeof(float)));
	    glUniform1f(ch1.projection_shader.scaler, ch1.sphere_fov);
	    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	    glDisableVertexAttribArray(ch1.projection_shader.pos);
	    glDisableVertexAttribArray(ch1.projection_shader.viewray);
	    glBindBuffer(GL_ARRAY_BUFFER, 0);
	    glUseProgram(0);
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, 0);
	}
        if (ch1.enabled && ch1.video) {
	    fetch_frame(&ch1);
        }
        if(ch1.enabled && !projection && ch1.video){
	    glUseProgram(ch1.vid_crop_shader.shader);
	    glUniform1i(glGetUniformLocation(ch1.vid_crop_shader.shader, "sample_Y"), 0);
	    glUniform1i(glGetUniformLocation(ch1.vid_crop_shader.shader, "sample_U"), 1);
	    glUniform1i(glGetUniformLocation(ch1.vid_crop_shader.shader, "sample_V"), 2);

            vec4 crop;
	    int postcrop_w = ch1.width - (ch1.crop.left + ch1.crop.right);
	    int postcrop_h = ch1.height - (ch1.crop.top + ch1.crop.bot);
	    crop[0] = (1.0 / ch1.width) * ch1.crop.left;
	    crop[1] = (1.0 / ch1.height) * ch1.crop.top;
	    crop[2] = (1.0 / ch1.width) * postcrop_w;
	    crop[3] = (1.0 / ch1.height) * postcrop_h;
	    glUniform4fv(ch1.vid_crop_shader.crop, 1, &crop[0]);
	    if (((float)postcrop_h / (float)postcrop_w) >
		((float)gctx.window_h / (float)gctx.window_w)) {
		glUniform1f(ch1.vid_crop_shader.aspect_h, 1.0);
		glUniform1f(ch1.vid_crop_shader.aspect_w,
			    ((float)postcrop_w / (float)postcrop_h) /
			    ((float)gctx.window_w / (float)gctx.window_h));
	    } else {
		glUniform1f(ch1.vid_crop_shader.aspect_h,
			    ((float)postcrop_h / (float)postcrop_w) /
			    ((float)gctx.window_h / (float)gctx.window_w));
		glUniform1f(ch1.vid_crop_shader.aspect_w, 1.0);
	    }
	    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	    glUseProgram(0);
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, 0);
	    glActiveTexture(GL_TEXTURE1);
	    glBindTexture(GL_TEXTURE_2D, 0);
	    glActiveTexture(GL_TEXTURE2);
	    glBindTexture(GL_TEXTURE_2D, 0);
	}
	if(ch1.enabled && projection && ch1.video){
	    vec4 crop;
	    crop[0] = (1.0 / ch1.width) * (ch1.width / 2.0 + ch1.crop.left / 2.0 - ch1.crop.right / 2.0);
	    crop[1] = (1.0 / ch1.height) * (ch1.height / 2.0 + ch1.crop.top / 2.0 - ch1.crop.bot / 2.0);
	    crop[2] = (1.0 / ch1.width) * (ch1.width - ch1.crop.left / 1.0 - ch1.crop.right / 1.0);
	    crop[3] = (1.0 / ch1.height) * (ch1.height - ch1.crop.top / 1.0 - ch1.crop.bot / 1.0);
	    glUseProgram(ch1.vid_projection_shader.shader);
	    glUniform1i(glGetUniformLocation(ch1.vid_projection_shader.shader, "sample_Y"), 0);
	    glUniform1i(glGetUniformLocation(ch1.vid_projection_shader.shader, "sample_U"), 1);
	    glUniform1i(glGetUniformLocation(ch1.vid_projection_shader.shader, "sample_V"), 2);

	    glEnableVertexAttribArray(ch1.vid_projection_shader.pos);
	    glEnableVertexAttribArray(ch1.vid_projection_shader.viewray);
	    glUniform4fv(ch1.vid_projection_shader.crop, 1, crop);
	    glBindBuffer(GL_ARRAY_BUFFER, viewrays_vbo);
	    glBufferData(GL_ARRAY_BUFFER, sizeof(viewrays), viewrays, GL_DYNAMIC_DRAW);
	    glVertexAttribPointer(ch1.vid_projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
				  5*sizeof(float), 0);
	    glVertexAttribPointer(ch1.vid_projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
				  5*sizeof(float), (void*)(2*sizeof(float)));
	    glUniform1f(ch1.vid_projection_shader.scaler, ch1.sphere_fov);
	    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	    glDisableVertexAttribArray(ch1.vid_projection_shader.pos);
	    glDisableVertexAttribArray(ch1.vid_projection_shader.viewray);
	    glBindBuffer(GL_ARRAY_BUFFER, 0);
	    glUseProgram(0);
	    glActiveTexture(GL_TEXTURE0);
	    glBindTexture(GL_TEXTURE_2D, 0);
	}
	nk_glfw3_render(&glfw, NK_ANTI_ALIASING_ON, gctx.nk_max_vertex_buffer,
			gctx.nk_max_element_buffer);

	glfwSwapBuffers(gctx.window);
	/* Force GPU sync to keep input delay low, also boost perofrmance
	   on GM45 Laptops like the Thinkpad X200. */
	glFinish();
    }

    avformat_close_input(&ch1.pFormatContext);
    av_packet_free(&ch1.pPacket);
    av_frame_free(&ch1.pFrame);
    avcodec_free_context(&ch1.pCodecContext);
    /* Cleanup */
    NFD_Quit();
    return 0;
}
