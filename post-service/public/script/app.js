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
      const posts = data.posts;
      const links = [];

      // Prepare the links data based on outgoingLinks
      posts.forEach(post => {
        if (post.outgoingLinks) {  // Check if outgoingLinks is defined
          post.outgoingLinks.forEach(linkedPost => {
            links.push({ source: post.id, target: linkedPost.id });
          });
        }
      });

      // Create the D3 force simulation
      const simulation = d3.forceSimulation(posts)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

      // Create the SVG container for the graph
      const svg = d3.select("#posts")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .call(d3.zoom().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        }))
      .append("g");

      // Create the link elements
      const link = svg.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .style("stroke", "#aaa");

      // Create the node elements as rectangles
      const node = svg.selectAll("rect")
        .data(posts)
        .enter()
        .append("rect")
        .attr("width", 120)
        .attr("height", 60)
        .attr("fill", "#69b3a2")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      // Add labels to the nodes
      const label = svg.selectAll(null)
        .data(posts)
        .enter()
        .append("text")
        .text(d => d.author?.username + ": " + d.content)
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "12px");

      // Add timestamps to the nodes
      const timestamp = svg.selectAll(null)
        .data(posts)
        .enter()
        .append("text")
        .text(d => d.timestamp)
        .style("text-anchor", "end")
        .style("alignment-baseline", "top")
        .style("font-size", "10px");

      // Update the positions of nodes and links on each tick
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("x", d => d.x)
          .attr("y", d => d.y);

        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);

        timestamp
          .attr("x", d => d.x + 60)
          .attr("y", d => d.y - 30);
      });

      // Drag functions for nodes
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    })
    .catch(error => console.error('Error loading posts:', error));
}



function logout() {
  location.href = "/auth/logout";
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

window.addEventListener("resize", function() {
  svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
  simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
  simulation.restart();
});
