/*
* INFT2202 - Assignment 3
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: March 22nd, 2025
* */

// IIFE

"use strict";

(function(){
    function DisplayCommunityPage() {
        console.log("Calling DisplayCommunityPage()...");

        const postForm = document.getElementById("postForm");
        const postsContainer = document.getElementById("postsContainer");

        // Load posts
        async function loadPosts() {
            const res = await fetch('/posts');
            const posts = await res.json();

            postsContainer.innerHTML = "";

            posts.forEach(post => {
                const postCard = document.createElement("div");
                postCard.className = "card mb-3";
                postCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${post.title}</h5>
                    <p class="card-text">${post.content}</p>
                    <p class="card-text"><small class="text-muted">by ${post.author}</small></p>
                    ${post.author === localStorage.getItem("user") ? `
                        <button class="btn btn-warning btn-sm editBtn" data-id="${post._id}">Edit</button>
                        <button class="btn btn-danger btn-sm ms-2 deleteBtn" data-id="${post._id}">Delete</button>
                    ` : ""}
                </div>
            `;
                postsContainer.appendChild(postCard);
            });

            addEventListenersToPostButtons();
        }

        // Add post
        postForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const newPost = {
                title: document.getElementById("postTitle").value,
                content: document.getElementById("postContent").value
            };

            try {
                const res = await fetch('/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPost)
                });
                if (!res.ok) throw new Error("Failed to create post");
                postForm.reset();
                loadPosts();
            } catch (err) {
                alert("You must be logged in to post.");
                console.error(err);
            }
        });

        // Add listeners for edit and delete buttons
        function addEventListenersToPostButtons() {
            const editBtns = document.querySelectorAll(".editBtn");
            const deleteBtns = document.querySelectorAll(".deleteBtn");

            editBtns.forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const newTitle = prompt("Enter new title:");
                    const newContent = prompt("Enter new content:");

                    if (newTitle && newContent) {
                        await fetch(`/posts/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: newTitle, content: newContent })
                        });
                        loadPosts();
                    }
                });
            });

            deleteBtns.forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    if (confirm("Delete this post?")) {
                        await fetch(`/posts/${id}`, {
                            method: 'DELETE'
                        });
                        loadPosts();
                    }
                });
            });
        }

        loadPosts();
    }


    function DisplayProfilePage() {
        console.log("Calling DisplayProfilePage()...");

        fetch('/users/profile')
            .then(res => {
                if (!res.ok) {
                    alert("You must be logged in to view your profile.");
                    window.location.href = "login.html";
                    return;
                }
                return res.json();
            })
            .then(user => {
                if (!user) return;

                // Populate form with user data
                document.getElementById("profileName").value = user.name || "";
                document.getElementById("profileEmail").value = user.email || "";
                document.getElementById("profileBio").value = user.bio || "";
            });

        // Handle profile form submission
        document.getElementById("profileForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const updatedData = {
                name: document.getElementById("profileName").value,
                email: document.getElementById("profileEmail").value,
                bio: document.getElementById("profileBio").value,
                password: document.getElementById("profilePassword").value // optional
            };

            if (!updatedData.password) delete updatedData.password;

            try {
                const res = await fetch('/users/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (!res.ok) throw new Error("Failed to update profile");
                alert("Profile updated successfully!");
            } catch (err) {
                console.error("Update error:", err);
                alert("Something went wrong while updating.");
            }
        });

        // Handle delete profile
        document.getElementById("deleteProfileBtn").addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

            try {
                const res = await fetch('/users/profile', {
                    method: 'DELETE'
                });

                if (!res.ok) throw new Error("Failed to delete account");
                alert("Account deleted.");
                window.location.href = "index.html";
            } catch (err) {
                console.error("Delete error:", err);
                alert("Error deleting account.");
            }
        });
    }


    // Function to load HTML content from a URL into a specified element
    function loadHTMLContent(url, elementId) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Insert the fetched HTML content into the element with the specified ID
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => {
                console.error(`Error loading content from ${url}:`, error);
            });
    }

    // Function to load the header
        function loadHeader() {
            loadHTMLContent('views/components/header.html', 'header-placeholder');
        }

    // Function to load the footer
        function loadFooter() {
            loadHTMLContent('views/components/footer.html', 'footer-placeholder');
        }

    // Call the functions to load the header and footer
        loadHeader();
        loadFooter();




    // Ensure Statistics Page Loads Only for Authenticated Users
    function DisplayStatisticsPage() {
        console.log("Calling DisplayStatisticsPage()...");

        // a4 change: changed if (!localStorage.getItem("username")) to express instead of localstorage
        fetch('/secure-content')
            .then(res => {
                if (!res.ok) {
                    // user is not logged in (session not active)
                    alert("Access Denied: Please log in first.");
                    window.location.href = "login.html";
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;

                console.log("Secure content:", data);

                // continue loading the page as normal
                fetch(".data/visitor_stats.json")
                    .then(response => response.json())
                    .then(data => {
                        console.log("Fetched Data:", data); // Debugging
                        createChart(data.labels);
                    })
                    .catch(error => console.error("Error fetching statistics:", error));
            });

        // fetch visitor stats
        fetch(".data/visitor_stats.json")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Data:", data); // Debugging
                createChart(data.labels, data.visitors);
            })
            .catch(error => console.error("Error fetching statistics:", error));
    }

    // function to create the Chart.js graph
    function createChart(labels, visitors) {
        const ctx = document.getElementById("visitorChart")?.getContext("2d");
        if (!ctx) return; // Prevent errors if on another page

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Visitors per Day",
                    data: visitors,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }


    // show statistics pagelink for authenticated users
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById("statisticsMenuItem").style.display = "block";
    }

    // function to store user username in localStorage/sessionStorage
    // then, redirect them to the home page or their previous page
    document.addEventListener("DOMContentLoaded", function() {
        // Check for username in localStorage
        const username = localStorage.getItem("username");

        // Handle login form submission
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", function(event) {
                event.preventDefault(); // Prevent the default form submission

                const usernameInput = document.getElementById("username");
                const usernameValue = usernameInput.value.trim();

                if (usernameValue) {
                    // Store the username in localStorage
                    localStorage.setItem("username", usernameValue);

                    // Redirect to the home page (index.html)
                    window.location.href = "index.html";
                } else {
                    alert("Please enter a username.");
                }
            });
        }

        // Navbar updates based on username in localStorage
        if (username) {
            document.getElementById("loginMenuItem").style.display = "none";
            document.getElementById("welcomeMenuItem").style.display = "block";
            document.getElementById("welcomeMessage").textContent = `Welcome, ${username}`;
            document.getElementById("logoutMenuItem").style.display = "block";

            // Update the title on the homepage with the username
            const homepageTitle = document.querySelector("h1");
            if (homepageTitle) {
                homepageTitle.textContent = `Welcome to Volunteer Connect, ${username}!`; // Set the title dynamically
            }
        } else {
            document.getElementById("loginMenuItem").style.display = "block";
            document.getElementById("welcomeMenuItem").style.display = "none";
            document.getElementById("logoutMenuItem").style.display = "none";
        }

        // Handle log out
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function() {
                localStorage.removeItem("username");
                window.location.href = "index.html"; // Redirect to homepage
            });
        }
    });




    // fetch and display news using News API
    async function fetchNews() {
        const apiKey = 'ccf212891065486f93ad2b4ebc7e39dc';
        const query = 'Oshawa';
        const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok') {
                displayNews(data.articles);
            } else {
                console.error("Failed to fetch news.", data.message);
            }
        } catch (error){
            console.error("Failed to fetch news.", error);
        }
    }
    // function to display the news
    function displayNews(articles) {
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = ''; // to clear previous results

        articles.forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.classList.add('article');

            const title = document.createElement('h3');
            title.textContent = article.title;

            const description = document.createElement('p');
            description.textContent = article.description;

            const link = document.createElement('a');
            link.href = article.url;
            link.textContent = 'Read more';
            link.target = '_blank';

            articleElement.appendChild(title);
            articleElement.appendChild(description);
            articleElement.appendChild(link);

            newsContainer.appendChild(articleElement);

        });
    }

    // fetch and display news when the page loads
    window.onload = fetchNews;

    function DisplayHomePage(){
        console.log("Calling DisplayHomePage()...");


        // Highlight the active page
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            if (link.href === window.location.href) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Call addDonateButton() to add the donate link to the navbar
        addDonateButton();



        // Back to Top button
        const backToTop = document.createElement("button");
        backToTop.id = "back-to-top";
        backToTop.textContent = "↑ Back to Top";
        backToTop.style.position = "fixed";
        backToTop.style.bottom = "20px";
        backToTop.style.right = "20px";
        backToTop.style.display = "none";
        backToTop.style.padding = "10px";
        backToTop.style.border = "none";
        backToTop.style.backgroundColor = "#3a6624";
        backToTop.style.color = "#fff";
        backToTop.style.cursor = "pointer";
        document.body.appendChild(backToTop);

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTop.style.display = "block";
            } else {
                backToTop.style.display = "none";
            }
        });

        // Get Involved button redirect
        const getInvolvedBtn = document.getElementById("getInvolved");
        if (getInvolvedBtn) {
            getInvolvedBtn.addEventListener("click", () => {
                window.location.href = "opportunities.html";
            });
        }
    }

    function addDonateButton() {
        const navbar = document.querySelector(".navbar-nav.ms-auto"); // Target the navbar container
        const donateLink = document.createElement("li");
        donateLink.className = "nav-item";
        donateLink.innerHTML = '<a class="nav-link donate-link" href="donate.html"><i class="fa-solid fa-heart"></i> Donate</a>';

        // Check if 'Donate' button already exists to avoid duplication
        const existingDonateLink = document.querySelector(".navbar-nav.ms-auto .nav-link[href='donate.html']");
        if (!existingDonateLink) {
            navbar.insertBefore(donateLink, navbar.querySelector(".dropdown"));
        }
    }
    // calling the search bar function when the page loads
    document.addEventListener("DOMContentLoaded", function() {
        addSearchBar();
    })
    // Function that lets user search events, volunteer opportunities, or news

    function addSearchBar() {
        const navbar = document.querySelector(".navbar-nav.ms-auto");

        if (!navbar) {
            console.error("Navbar not found!");
            return;
        }

        const searchContainer = document.createElement("li");
        searchContainer.className = "nav-item";
        searchContainer.style.position = "relative"; // Allows positioning of search results

        searchContainer.innerHTML = `
        <input type="text" id="searchBar" class="form-control" placeholder="Search..." aria-label="Search">
        <div id="searchResults" class="search-results"></div>
    `;

        navbar.insertBefore(searchContainer, navbar.firstChild);

        document.getElementById("searchBar").addEventListener("input", handleSearch);
        document.getElementById("searchBar").addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                navigateToPage();
            }
        });
    }

    function navigateToPage() {
        const query = document.getElementById("searchBar").value.toLowerCase().trim();

        const pages = {
            "events": "events.html",
            "opportunities": "opportunities.html",
            "volunteer": "opportunities.html",
            "contact": "contact.html",
            "gallery": "gallery.html",
            "about": "about.html"
        };

        if (pages[query]) {
            window.location.href = pages[query]; // Redirect to the corresponding page
        } else {
            alert("No matching page found. Try 'events', 'opportunities', 'contact', 'gallery', or 'about'.");
        }
    }

    // Function that handles the searches the users make

    function handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        const searchResultsDiv = document.getElementById("searchResults");

        const pages = {
            "events": "events.html",
            "opportunities": "opportunities.html",
            "volunteer": "opportunities.html",
            "contact": "contact.html",
            "gallery": "gallery.html",
            "about": "about.html"
        };

        if (query && pages[query]) {
            searchResultsDiv.innerHTML = `Showing results for: <strong>${query}</strong>`;
            searchResultsDiv.style.display = "block";
        } else {
            searchResultsDiv.innerHTML = "";
            searchResultsDiv.style.display = "none";
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        fetch("gallery.json")
            .then(response => response.json())
            .then(images => {
                const galleryContainer = document.getElementById("gallery");
                images.forEach((image, index) => {
                    const colDiv = document.createElement("div");
                    colDiv.className = "col-lg-3 col-md-4 col-6 mb-4";

                    const imgElement = document.createElement("img");
                    imgElement.src = image.full;
                    imgElement.alt = image.caption;
                    imgElement.className = "img-fluid rounded gallery-img";
                    imgElement.onclick = () => openModal(index, images);

                    colDiv.appendChild(imgElement);
                    galleryContainer.appendChild(colDiv);
                });
            })
            .catch(error => console.error("Error loading gallery:", error));
    });

    function openModal(index, images) {
        const modal = document.getElementById("myModal");
        const modalContent = document.getElementById("modalContent");
        const captionText = document.getElementById("caption");

        modalContent.innerHTML = `<img src="${images[index].full}" class="img-fluid">`;
        captionText.innerText = images[index].caption;

        modal.style.display = "block";

        document.querySelector(".prev").onclick = () => changeSlide(index - 1, images);
        document.querySelector(".next").onclick = () => changeSlide(index + 1, images);
    }

    function changeSlide(newIndex, images) {
        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;
        openModal(newIndex, images);
    }

    function closeModal() {
        const modal = document.getElementById("myModal");
        modal.style.display = "none";
    }

    // close modal if user clicks outside the image
    window.onclick = function (event) {
        const modal = document.getElementById("myModal");
        if (event.target === modal) {
            closeModal();
        }
    }


    document.addEventListener("DOMContentLoaded", function () {
        const loginModalEl = document.getElementById("loginModal");
        const registerModalEl = document.getElementById("registerModal");

        const registerLink = document.getElementById("registerLink");
        const loginLink = document.getElementById("loginLink");
        const cancelRegisterButton = document.getElementById("cancelRegisterButton");

        document.addEventListener("DOMContentLoaded", function () {
            // Modal elements
            const loginModalEl = document.getElementById("loginModal");
            const registerModalEl = document.getElementById("registerModal");

            // Buttons & Links
            const loginNavButton = document.querySelector('[data-bs-target="#loginModal"]');
            const registerLink = document.getElementById("registerLink");
            const loginLink = document.getElementById("loginLink");
            const cancelRegisterButton = document.getElementById("cancelRegisterButton");

            // Helper function to get or create Bootstrap modal instance
            const getBootstrapModal = (modalEl) => bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

            // Show Login Modal when navbar login button is clicked
            if (loginNavButton) {
                loginNavButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    getBootstrapModal(loginModalEl).show();
                });
            }

            // Switch from Login to Register
            if (registerLink) {
                registerLink.addEventListener("click", function (event) {
                    event.preventDefault();
                    const loginModal = getBootstrapModal(loginModalEl);
                    loginModal.hide();

                    loginModalEl.addEventListener("hidden.bs.modal", function () {
                        getBootstrapModal(registerModalEl).show();
                    }, { once: true });
                });
            }

            // Switch from Register to Login
            if (loginLink) {
                loginLink.addEventListener("click", function (event) {
                    event.preventDefault();
                    const registerModal = getBootstrapModal(registerModalEl);
                    registerModal.hide();

                    registerModalEl.addEventListener("hidden.bs.modal", function () {
                        getBootstrapModal(loginModalEl).show();
                    }, { once: true });
                });
            }

            // Close Register Modal when Cancel is clicked
            if (cancelRegisterButton) {
                cancelRegisterButton.addEventListener("click", function () {
                    getBootstrapModal(registerModalEl).hide();
                });
            }
        });


        // Function to show the login modal after hiding the register modal
        if (loginLink) {
            loginLink.addEventListener("click", function (event) {
                event.preventDefault();
                const registerModal = bootstrap.Modal.getInstance(registerModalEl);
                if (registerModal) {
                    registerModal.hide();
                    registerModalEl.addEventListener("hidden.bs.modal", function () {
                        const loginModal = new bootstrap.Modal(loginModalEl);
                        loginModal.show();
                    }, { once: true });
                } else {
                    const loginModal = new bootstrap.Modal(loginModalEl);
                    loginModal.show();
                }
            });
        }

        // Handle cancel button in the register modal
        if (cancelRegisterButton) {
            cancelRegisterButton.addEventListener("click", function () {
                const registerModal = bootstrap.Modal.getInstance(registerModalEl);
                if (registerModal) {
                    registerModal.hide();
                }
            });
        }

        // Handle login form submission and UI update
        const loginForm = document.getElementById("loginForm");
        const authContainer = document.getElementById("auth-container");

        function updateUI() {
            const user = localStorage.getItem("user");
            if (authContainer) {
                if (user) {
                    authContainer.innerHTML = `
                    <span>Welcome, ${user}!</span>
                    <button id="logout-btn" class="btn btn-outline-danger ms-3">
                        <i class="fa-solid fa-right-from-bracket"></i> Log Out
                    </button>
                `;
                    document.getElementById("logout-btn").addEventListener("click", function () {
                        localStorage.removeItem("user");
                        updateUI();
                    });
                } else {
                    authContainer.innerHTML = `
                    <button id="login-btn" class="btn btn-outline-primary">
                        <i class="fa-solid fa-sign-in-alt"></i> Log In
                    </button>
                `;
                    document.getElementById("login-btn").addEventListener("click", function () {
                        alert("Please use the Login button in the navbar.");
                    });
                }
            }
        }

        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();

                // a4 change: localStorage.setItem("username", usernameValue); to fetch login method
                fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, password: password })
                })
                    .then(res => {
                        if (res.ok) {
                            window.location.href = "index.html";
                        } else {
                            alert("Login failed");
                        }
                    });

            });
        }

        updateUI(); // Initial UI update on page load
    });




    // function to open the signup modal for volunteer opportunities
    function openSignupModal(){
        const modal = document.getElementById("signupModal");
        modal.style.display = "block";
    }

    // Opportunities page functionality
    function DisplayOpportunitiesPage() {
        console.log("Calling DisplayOpportunitiesPage()...");

        // Call addDonateButton() to add the donate link to the navbar
        addDonateButton();

        // sample data for volunteer events
        const opportunities = [
            {
                title: "Community Clean-Up",
                description: "Join us for a community clean-up to keep our streets clean and green.",
                date: "23-01-2025 10:00 AM"
            },
            {
                title: "Food Bank Donation",
                description: "Help organize donations at the local food bank for those in need.",
                date: "27-01-2025 9:00 AM"
            },
            {
                title: "Animal Shelter Support",
                description: "Assist with walking dogs and helping out at the animal shelter.",
                date: "30-01-2025 2:00 PM"
            },
        ];

        // function to display volunteer opportunities
        function displayOpportunities(){
            const opportunityList = document.getElementById("opportunityList");
            opportunityList.innerHTML = ""; // clearing the list before adding

            // responsible for dynamically generating and displaying cards for each "opportunity" in a list, and adding functionality to the "Sign Up" buttons within those cards
            opportunities.forEach((opportunity, index) => {
                const card = document.createElement("div");
                card.classList.add("card");

                card.innerHTML = `
                    <h3>${opportunity.title}</h3>
                    <p>${opportunity.description}</p>
                    <p><strong>Date & Time: </strong> ${opportunity.date}</p>
                    <button class="signupButton" data-index="${index}">Sign Up</button>
                    `
                ;
                opportunityList.appendChild(card);
            });

            // event listeners to each "sign up" button
            const signupButtons = document.querySelectorAll(".signupButton");
            signupButtons.forEach(button => {
                button.addEventListener("click", function() {
                    openSignupModal();
                });
            });
        }

        // modal functionality
        const modal = document.getElementById("signupModal");
        const closeModalButton = document.querySelectorAll(".closeButton"); // Use querySelector to target the class
        const signupForm = document.getElementById("signupForm");
        const confirmationMessage = document.getElementById("confirmationMessage");

        let selectedOpportunityIndex = null;

        // close the modal
        closeModalButton.onclick = function (){
            modal.style.display = "none";
        }

        // function to close the modal
        const modalCloseButton = document.querySelector(".close-btn");  // Use querySelector to target the class
        modalCloseButton.onclick = function() {
            const modal = document.getElementById("signupModal");
            modal.style.display = "none"; // Hide the modal
        }

        // close the modal if clicked outside
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }

        // form submission and validation
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault(); // prevent the default form submission

            // validating form fields
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const role = document.getElementById("role").value;

            // check if all fields are filled out
            if (name.trim() !=="" && email.trim() !=="" && role.trim() !=="") {
                confirmationMessage.textContent = "You have successfully signed up for the volunteer event!";
                confirmationMessage.style.color = "lightgreen";


            } else {
                confirmationMessage.textContent = "Please fill out all fields.";
                confirmationMessage.style.color = "red";
            }
        });

        // initialize the page with opportunities
        displayOpportunities();
    }

    // events page functionality
    function DisplayEventsPage() {
        console.log("Calling DisplayEventsPage()...");


        // a4 change: adding express method to protect
        fetch('/secure-content')
            .then(res => {
                if (!res.ok) {
                    alert("Access Denied: Please log in first.");
                    window.location.href = "login.html";
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;

                console.log("Access granted to Events page:", data);

                // If authenticated, proceed with original logic
                addDonateButton();

                let currentDate = new Date();
                let selectedCategory = "all";

                // function to load events via AJAX
                function loadEventsData(callback) {
                    // use AJAX to fetch the data
                    // requirement: dynamic content loading
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", "/events.json", true);
                    xhr.onload = function () {
                        // requirement: error handling
                        if (xhr.status === 200) {
                            // parsing the response json data
                            const events = JSON.parse(xhr.responseText);
                            callback(events); // passing the events to the callback function
                        } else {
                            // handle the error
                            console.error("Unable to load events.", xhr.status);
                            alert('Failed to load events.');
                        }
                    };
                    xhr.onerror = function () {
                        // handle error
                        console.error("Unable to load events.");
                        alert('Failed to load events.');
                    };
                    xhr.send();
                }

                function generateCalendarDays(year, month) {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    let calendarDays = "";

                    const filteredEvents = events.filter(event => selectedCategory === "all" || event.category === selectedCategory);
                    const eventDates = filteredEvents.map(event => formatDateToString(new Date(event.date)));

                    for (let i = 1; i <= daysInMonth; i++) {
                        const dayDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
                        const isEventDay = eventDates.includes(dayDate);

                        calendarDays += `
                <div class="day ${isEventDay ? 'highlight' : ''}" data-date="${dayDate}">${i}</div>
            `;
                    }

                    return calendarDays;
                }

                function displayCalendar() {
                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                    ];

                    const monthName = monthNames[currentDate.getMonth()];
                    document.getElementById("calendarMonth").innerText = `${monthName} ${currentDate.getFullYear()}`;
                    document.getElementById("calendarDays").innerHTML = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());

                    document.querySelectorAll(".day").forEach((day) => {
                        day.addEventListener("click", function() {
                            const selectedDate = day.getAttribute("data-date");
                            displayEventsForDate(selectedDate, events);
                        });
                    });
                }

                function displayEventsForDate(selectedDate) {
                    const eventDetails = document.getElementById("eventDetails");
                    eventDetails.innerHTML = ""; // Clear existing events

                    const filteredEvents = events.filter((event) => {
                        const eventDate = formatDateToString(new Date(event.date));
                        return eventDate === selectedDate && (selectedCategory === "all" || event.category === selectedCategory);
                    });

                    if (filteredEvents.length > 0) {
                        filteredEvents.forEach((event) => {
                            const eventElement = document.createElement("div");
                            eventElement.classList.add("event", event.category);
                            eventElement.innerHTML = `
                <strong>${event.title}</strong>
                <p>${event.description}</p>
                <p><small>Date: ${new Date(event.date).toLocaleDateString()}</small></p>
            `;
                            eventDetails.appendChild(eventElement);
                        });
                    } else {
                        eventDetails.innerHTML = "<p>No events for this day.</p>";
                    }
                }

                function formatDateToString(date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                }

                function changeMonth(direction) {
                    currentDate.setMonth(currentDate.getMonth() + direction);
                    displayCalendar();
                }

                document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
                document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

                function filterEvents() {
                    const categoryFilter = document.getElementById("eventCategory");
                    categoryFilter.addEventListener("change", function () {
                        selectedCategory = categoryFilter.value;
                        displayCalendar();
                        displayEventsForDate(formatDateToString(currentDate));
                    });
                }

                // a4 update: instead of hard coding events, replacing them with a section
                // that uses fetch call to the backend
                // const events = [
                //     { date: "2025-01-10", title: "Fundraiser for Kids", category: "fundraisers", description: "Join us for a fundraising event to support local children." },
                //     { date: "2025-01-15", title: "Community Workshop", category: "workshops", description: "Learn how to build a birdhouse in this community workshop." },
                //     { date: "2025-01-20", title: "Park Cleanup", category: "cleanups", description: "Help us clean up the park and make the community a better place!" },
                //     { date: "2025-01-25", title: "Fundraising Gala", category: "fundraisers", description: "A charity gala to raise funds for the local hospital." },
                //     { date: "2025-01-30", title: "Tech Workshop", category: "workshops", description: "Join us for a hands-on tech workshop on web development." },
                //     { date: "2025-02-05", title: "Beach Cleanup", category: "cleanups", description: "Help clean up the beach and protect the environment." },
                //     { date: "2025-02-15", title: "Blind Date", category: "workshops", description: "Assist the blind this Valentine's Day." },
                // ];
                let events = [];

                async function loadEventsFromAPI() {
                    try {
                        const res = await fetch('/events');
                        if (!res.ok) throw new Error("Failed to load events");
                        events = await res.json();
                        displayCalendar(); // refresh UI
                        displayEventsForDate(formatDateToString(currentDate), events);
                    } catch (err) {
                        console.error("Error fetching events:", err);
                        alert("Could not load events from server.");
                    }
                }

                // Handle Add Event form submission
                const eventForm = document.getElementById("eventForm");
                if (eventForm) {
                    eventForm.addEventListener("submit", async function (e) {
                        e.preventDefault();

                        const newEvent = {
                            title: document.getElementById("eventTitle").value,
                            date: document.getElementById("eventDate").value,
                            category: document.getElementById("eventCategory").value,
                            description: document.getElementById("eventDescription").value
                        };

                        try {
                            const res = await fetch('/events', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newEvent)
                            });

                            if (!res.ok) throw new Error("Failed to add event");
                            alert("Event added!");
                            loadEventsFromAPI(); // Reload events after adding
                        } catch (err) {
                            console.error("Error adding event:", err);
                            alert("Could not add event.");
                        }
                    });
                }


                loadEventsData(events => {
                    displayCalendar(events);
                    displayEventsForDate(formatDateToString(currentDate), events); // Initial events display
                    loadEventsFromAPI(); // Fetch events from server instead of hardcoded
                    filterEvents();
                })
            });



    }



    // contact page functionality
    function DisplayContactPage() {
        console.log("Calling DisplayContactPage()...");

        // Call addDonateButton() to add the donate link to the navbar
        addDonateButton();

        const contactForm = document.getElementById("contactForm");
        const confirmationModalElement = document.getElementById("confirmationModal");
        const confirmationModal = new bootstrap.Modal(confirmationModalElement);

        // validating and handling form submissions
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault(); // preventing default submissions

            // input validation
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const subject = document.getElementById("subject").value.trim();
            const feedback = document.getElementById("feedback").value.trim();


            if (!name || !email || !subject || !feedback) {
                alert("Please fill out all fields.");
            }

            // simulating an AJAX request without a real server
            setTimeout(() => {
                // Populate the modal with user input
                confirmationBody.innerHTML = `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Feedback:</strong> ${feedback}</p>
                <p>Your feedback has been submitted successfully.</p>
            `;

                confirmationModal.show();

                // Redirect to homepage after 5 seconds
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 5000);
            }, 1000); // Simulate a network delay

        });

    }

    function DisplayPrivacyPage() {
        // Call addDonateButton() to add the donate link to the navbar
        addDonateButton();
    }

    function DisplayTermsPage() {
        // Call addDonateButton() to add the donate link to the navbar
        addDonateButton();
    }


    function Start(){
        console.log("Starting...");

        switch (document.title) {
            case "Home":
                DisplayHomePage();
                break;
            case "Opportunities":
                DisplayOpportunitiesPage();
                break;
            case "Events":
                DisplayEventsPage();
                break;
            case "Contact Us":
                DisplayContactPage();
                break;
            case "Privacy Policy":
                DisplayPrivacyPage();
                break;
            case "Terms of Service":
                DisplayTermsPage();
                break;
            case "Statistics":
                DisplayStatisticsPage();
            case "Profile":
                DisplayProfilePage();
                break;
            case "Community":
                DisplayCommunityPage();
                break;

        }
    }

    window.addEventListener("load", Start);

})();