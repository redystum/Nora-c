#include "projects.h"

void get_projects(struct mg_connection *c, struct mg_http_message *hm) {
    (void) hm;
    const char *response = "[{\"id\": 1, \"name\": \"Project 1\"}, {\"id\": 2, \"name\": \"Project 2\"}]";
    mg_http_reply(c, 200, "Content-Type: application/json\r\n", "%s", response);
}