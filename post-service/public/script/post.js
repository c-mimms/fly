
function addCommentForm(parentId, container, isTopLevel) {
    if(container.querySelectorAll(':scope > form').length > 0) return;
    const form = document.createElement('form');
    form.classList.add('add-comment-form');
    form.innerHTML = `
      <input type="hidden" name="parentId" value="${parentId}">
      <textarea name="content" placeholder="Enter a reply" rows="3" cols="50" required></textarea>
      <button type="submit" class="submit-button">Reply</button>
  `;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const content = form.elements.content.value;
        const outgoingLinks = form.elements.parentId.value;

        const data = { content, outgoingLinks };

        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Optionally refresh the page or update the comment list
        } else {
            // Handle or display error
        }
    });

    const firstChild = container.firstChild;
    const commentNest = container.querySelector('.nested-comments');
    isTopLevel ? container.insertBefore(form, firstChild) : container.insertBefore(form, commentNest);
}

const addCommentButtons = document.querySelectorAll('.addCommentButton');
const commentsContainer = document.getElementById('commentsContainer');


addCommentButtons.forEach(button => {
    button.addEventListener('click', () => {
        const parentId = button.dataset.commentId;
        const parentComment = button.closest('.comment');

        const newCommentContainer = parentComment ? parentComment : commentsContainer;
        const isTopLevel = parentComment != newCommentContainer;
        addCommentForm(parentId, newCommentContainer, isTopLevel);
    });
});
