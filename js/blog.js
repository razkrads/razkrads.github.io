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
        postElement.innerHTML = `
          <div class="blog-post-content">
            <h3>${post.title}</h3>
            <p>${post.body.substring(0, 400)}...</p> <!-- Excerpt from body -->
            <a href="post.html?file=${post.filename}" class="read-more">Læs mere</a>
          </div>
        `;
        container.appendChild(postElement);
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