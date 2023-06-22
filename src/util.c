#include "util.h"

float fading_average(float alpha, float old_average, float new_sample)
{
	return alpha * new_sample + (1.0 - alpha) * old_average;
}