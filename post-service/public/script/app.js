// scripts.js

function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

function loadPosts() {
fetch('/api/posts')
  .then(response => response.json())
  .then(data => {
    const postsElement = document.getElementById('posts');
    postsElement.innerHTML = '';  // Clear the existing posts
    data.posts.forEach(post => {
      const li = document.createElement('li');
      li.textContent = post.content;
      postsElement.appendChild(li);
    });
  })
  .catch(error => console.error('Error loading posts:', error));
}

function logout() {
location.href = "/logout";
}

function createPost(event) {
  event.preventDefault();

  const form = document.getElementById('createPostForm');
  const content = form.elements.content.value;

  const data = { content };

  fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((newPost) => {
      console.log('New post created:', newPost);
      form.reset();
      closeModal();
      loadPosts();  // Reload the posts after a new one is created
    })
    .catch((error) => {
      console.error('Error creating post:', error);
    });
}

// Initial load of posts
loadPosts();

// Close modal on initial page load
closeModal();
