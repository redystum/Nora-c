#include "frontend.h"

static void ev_handler(struct mg_connection *c, int ev, void *ev_data) {
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *) ev_data;
        struct mg_http_serve_opts opts = {.root_dir = "./frontend/web/dist"};
        mg_http_serve_dir(c, hm, &opts);
    }
}

int save_backend_hosts(threads_args_t *args) {
    char listen_addr[256];
    snprintf(listen_addr, sizeof(listen_addr), "http://%s:%d", args->server_host, args->server_port);

    char ws_listen_addr[256];
    snprintf(ws_listen_addr, sizeof(ws_listen_addr), "ws://%s:%d", args->server_host, args->ws_port);

    FILE *file = fopen("frontend/web/dist/backend.txt", "w");
    if (file == NULL) {
        return 1;
    }

    fprintf(file, "%s\n%s\n", listen_addr, ws_listen_addr);
    fclose(file);

    return 0;
}

void *start_frontend(void *arg) {
    threads_args_t *args = (threads_args_t *) arg;

    mg_log_set(MG_LL_ERROR);
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);

    char listen_addr[256];
    snprintf(listen_addr, sizeof(listen_addr), "http://%s:%d", args->web_host, args->web_port);

    mg_http_listen(&mgr, listen_addr, ev_handler, NULL);

    printf("Frontend server started on %s\n", listen_addr);

    if (save_backend_hosts(args) != 0) {
        mg_mgr_free(&mgr);
        ERROR(1, "Error saving backend hosts");
        return NULL;
    }

    char open_cmd[256 + 20];
    snprintf(open_cmd, sizeof(open_cmd), "xdg-open %s", listen_addr);
    system(open_cmd);

    while (keep_running) {
        mg_mgr_poll(&mgr, 1000);
    }

    mg_mgr_free(&mgr);

    printf("bye! (from frontend)\n");

    return 0;
}
