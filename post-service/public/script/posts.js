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

}

function logout() {
  location.href = "logout";
}

function createPost(event) {
    event.preventDefault();

    const form = document.getElementById('createPostForm');
    const content = form.elements.content.value;

    const data = { content };

    fetch('/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((newPost) => {
        // Handle the newly created post as needed
        console.log('New post created:', newPost);
        form.reset();
        closeModal();
      })
      .catch((error) => {
        console.error('Error creating post:', error);
        // Handle the error case
      });
  }

  // ...
  closeModal();

