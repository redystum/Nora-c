#ifndef NORA_C_UTILS_H
#define NORA_C_UTILS_H

#define CORS "Access-Control-Allow-Origin: *\r\n"
#define DEFAULT_JSON_HEADER CORS "Content-Type: application/json\r\n"
#define DEFAULT_TEXT_HEADER CORS "Content-Type: text/plain\r\n"

int mkdir_p(const char *path);

#endif //NORA_C_UTILS_H