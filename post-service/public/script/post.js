
const addCommentButtons = document.querySelectorAll('.addCommentButton');
const commentsContainer = document.getElementById('commentsContainer');

function addCommentForm(parentId, depth, container) {
    const form = document.createElement('form');
    form.innerHTML = `
      <input type="hidden" name="parentId" value="${parentId}">
      <input type="hidden" name="depth" value="${depth}">
      <textarea name="content" placeholder="Enter a reply to this comment" rows="3" cols="50" required></textarea>
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

    var firstChild = container.firstChild;
    container.insertBefore(form, firstChild);
}

addCommentButtons.forEach(button => {
    button.addEventListener('click', () => {
        const parentId = button.dataset.commentId;
        let depth = 0;
        const parentComment = button.closest('.comment');
        if (parentComment) {
            depth = parentComment.querySelectorAll('.comment').length;
        }

        const commentContainer = parentComment ? parentComment : commentsContainer;
        addCommentForm(parentId, depth, commentContainer);
    });
});
