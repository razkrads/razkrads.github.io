/**
 * Blog post functionality for ASP website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Fetch and display blog posts
  fetchBlogPosts();
});

/**
 * Fetches blog posts from GitHub repository and displays them
 */
async function fetchBlogPosts() {
  const repoOwner = "razkrads";
  const repoName = "razkrads.github.io";
  const folderPath = "src/posts"; // Folder where JSON files are stored
  const container = document.getElementById("blog-posts-container");

  if (!container) return;

  try {
    // Fetch list of JSON files from GitHub
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);

    const files = await response.json();

    // Filter only .json files
    const jsonFiles = files.filter(file => file.name.endsWith(".json"));

    // Fetch and display posts
    const posts = await Promise.all(
      jsonFiles.map(file =>
        fetch(file.download_url)
          .then(res => res.json())
          .then(data => ({ ...data, filename: file.name })) // Add filename to data
      )
    );

    // Filter out unpublished posts
    const publishedPosts = posts.filter(post => post.published);

    // Sort posts by latest first (if you have a `date` field in the future, sort by `date`)
    publishedPosts.reverse();

    container.innerHTML = ""; // Clear loading state

    // Show only the latest 3 posts
    publishedPosts.slice(0, 3).forEach(post => {
      const postElement = document.createElement("div");
      postElement.className = "blog-post";
      
      // Create the collapsed view (preview)
      const previewHTML = `
        <div class="blog-post-content">
          <h3>${post.title}</h3>
          <p class="post-date">${post.date}</p>
          <div class="post-description">${post.description}</div>
          <button class="read-more-btn" data-post-id="${post.filename}">Læs mere</button>
        </div>
        <div class="blog-post-full" id="full-${post.filename}" style="display: none;">
          <h3>${post.title}</h3>
          <p class="post-date">${post.date}</p>
          <div class="post-description">${post.description}</div>
          <div class="post-body">${post.body}</div>
          <button class="read-less-btn" data-post-id="${post.filename}">Læs mindre</button>
        </div>
      `;
      
      postElement.innerHTML = previewHTML;
      container.appendChild(postElement);
    });
    
    // Add event listeners to "Læs mere" buttons
    document.querySelectorAll('.read-more-btn').forEach(button => {
      button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const previewEl = this.closest('.blog-post-content');
        const fullPostEl = document.getElementById(`full-${postId}`);
        
        // Hide preview, show full post
        previewEl.style.display = 'none';
        fullPostEl.style.display = 'block';
        
        // Smooth scroll to the post top
        fullPostEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    
    // Add event listeners to "Læs mindre" buttons
    document.querySelectorAll('.read-less-btn').forEach(button => {
      button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const fullPostEl = document.getElementById(`full-${postId}`);
        const previewEl = fullPostEl.previousElementSibling;
        
        // Hide full post, show preview
        fullPostEl.style.display = 'none';
        previewEl.style.display = 'block';
        
        // Smooth scroll to the post top
        previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Show message if no posts are found
    if (publishedPosts.length === 0) {
      container.innerHTML = `<p>Ingen blogindlæg tilgængelige.</p>`;
    }

  } catch (error) {
    console.error("Error loading blog posts:", error);
    container.innerHTML = `<p>Kunne ikke indlæse blogindlæg.</p>`;
  }
}