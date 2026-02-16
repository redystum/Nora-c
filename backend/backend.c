#include "backend.h"
#include "controllers/controllers.h"
#include "utils/utils.h"

static const controller_t controllers[] = {
    {.path = "/", .method = NORA_GET, .fun = get_status},
    {.path = "/projects", .method = NORA_GET, .fun = get_projects},
    {.path = "/projects", .method = NORA_POST, .fun = create_project},
    {.path = "/projects/files", .method = NORA_GET, .fun = get_project_files},
    {.path = "/projects/files/delete", .method = NORA_POST, .fun = delete_project_file},

    {.path = "/files", .method = NORA_GET, .fun = get_file},
    {.path = "/files", .method = NORA_POST, .fun = create_file},
    {.path = "/files/update", .method = NORA_POST, .fun = update_file},

    // {.path = "folders", .method = NORA_GET, .fun = get_folder},
    {.path = "/folders", .method = NORA_POST, .fun = create_folder},

    // end
    {NULL, NULL, 0}
};

static void ev_handler(struct mg_connection *c, int ev, void *ev_data) {
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *) ev_data;
        DEBUG("Received HTTP message:\n %s", hm->message.buf);

        // cors stuff :/
        if (mg_match(hm->method, mg_str("OPTIONS"), NULL)) {
            mg_http_reply(c, 204,
                "Access-Control-Allow-Origin: *\r\n"
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
                "Access-Control-Max-Age: 86400\r\n"
                "Content-Length: 0\r\n", "");
            return;
        }

        if (mg_match(hm->uri, mg_str("/ws"), NULL)) {
            // Upgrade the connection to WebSocket
            mg_ws_upgrade(c, hm, NULL);
            DEBUG("Client upgraded to WebSocket!\n");
            return;
        }

        int i = 0;
        int found = 0;
        DEBUG("Searching URI \"%.*s\" with method \"%.*s\"\n", (int) hm->uri.len, hm->uri.buf, (int) hm->method.len, hm->method.buf);
        while (controllers[i].path != NULL) {
            if (mg_match(hm->uri, mg_str(controllers[i].path), NULL)) {
                controller_t ct = controllers[i];
                DEBUG("Matched path: %s, method: %s\n", ct.path, ct.method == NORA_GET ? "GET" : "POST");
                if (ct.method == NORA_GET && mg_match(hm->method, mg_str("GET"), NULL)) {
                    found = 1;
                    ct.fun(c, hm);
                    break;
                } else if (ct.method == NORA_POST && mg_match(hm->method, mg_str("POST"), NULL)) {
                    found = 1;
                    ct.fun(c, hm);
                    break;
                }
            }
            i++;
        }

        if (!found) {
            error_response(c, 404, "Not found");
        }
    } else if (ev == MG_EV_WS_MSG) {
        DEBUG("Received WebSocket message");
        struct mg_ws_message *wm = (struct mg_ws_message *) ev_data;

        DEBUG("Received message: %.*s\n", (int) wm->data.len, wm->data.buf);

        struct mg_str response = mg_str("Hello from the websocket!");
        mg_ws_send(c, response.buf, response.len, WEBSOCKET_OP_TEXT);
    }
}

void *start_backend(void *arg) {
    threads_args_t *args = (threads_args_t *) arg;

    mg_log_set(MG_LL_ERROR);
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);

    char listen_addr[256];
    snprintf(listen_addr, sizeof(listen_addr), "http://%s:%d", args->server_host, args->server_port);

    char ws_listen_addr[256];
    snprintf(ws_listen_addr, sizeof(ws_listen_addr), "http://%s:%d", args->server_host, args->ws_port);

    mg_http_listen(&mgr, listen_addr, ev_handler, NULL);
    mg_http_listen(&mgr, ws_listen_addr, ev_handler, NULL);

    printf("Backend HTTP server started on %s\n", listen_addr);
    printf("Backend WS server started on ws:// or %s\n", ws_listen_addr);

    while (keep_running) {
        mg_mgr_poll(&mgr, 1000);
    }

    mg_mgr_free(&mgr);

    printf("bye! (from backend)\n");

    return 0;
}
