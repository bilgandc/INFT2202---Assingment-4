"use strict";

class Router {
    constructor(routes) {
        this.routes = routes;
        this.loadInitialRoute();
    }

    loadInitialRoute() {
        window.addEventListener("hashchange", () => this.loadRoute());
        this.loadRoute(); // Load first route when page opens
    }

    loadRoute() {
        const path = window.location.hash.replace("#", "") || "index";
        const route = this.routes[path] || this.routes["404"];


        fetch(route)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error. Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                document.getElementById("app").innerHTML = html;

            })
            .catch(error => {
                console.error("Error loading route:", error);
                document.getElementById("app").innerHTML = "<h2>Page Not Found</h2>";
            });
    }
}

// define routes
const routes = {
    "index": "./index.html",
    "about": "./views/content/about.html",
    "events": "./views/content/events.html",
    "opportunities": "./views/content/opportunities.html",
    "contact": "./views/content/contact.html",
    "statistics": "./views/content/statistics.html",
    "404": "./views/content/404.html",
    "gallery": "./views/content/gallery.html",
    "service": "./views/content/service.html",
    "privacy": "./views/content/privacy.html",
    "profile": "./views/content/profile.html",
    "community": "./views/content/community.html",

};

// initialize Router
document.addEventListener("DOMContentLoaded", () => {
    new Router(routes);
});
