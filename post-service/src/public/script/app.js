// scripts.js

function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// Keep track of the selected posts
let selectedPosts = [];

// Update the selection state of the post elements
function updatePostSelection() {
  const postElements = document.querySelectorAll("g");

  postElements.forEach((postElement) => {
    const post = postElement.__data__;
    const isSelected = selectedPosts.includes(post);

    postElement.classList.toggle("selected", isSelected);
  });
  console.log(selectedPosts);

  //Show button
  const buttonGroup = document.getElementById("buttonGroup");
  const createLinkedPostButton = document.getElementById("createLinkedPostButton");

  if (selectedPosts.length > 0) {
    // buttonGroup.style.display = "block";
    // createLinkedPostButton.addEventListener("click", openCreateLinkedPostModal);
    const linkedPostsInput = document.getElementById('linkedPosts');
    const linkedPostIds = selectedPosts.map(post => post.id);
    linkedPostsInput.value = JSON.stringify(linkedPostIds);
  } else {
    const linkedPostsInput = document.getElementById('linkedPosts');
    linkedPostsInput.value = "";
    // buttonGroup.style.display = "none";
    // createLinkedPostButton.removeEventListener("click", openCreateLinkedPostModal);
  }
}

function openCreateLinkedPostModal() {
  const linkedPostsInput = document.getElementById('linkedPosts');
  const linkedPostIds = selectedPosts.map(post => post.id);
  linkedPostsInput.value = JSON.stringify(linkedPostIds);
  openModal();
}

function createPostElement(post) {
  // Create a container for the post

  const postContainer = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // Convert the markdown content to HTML
  const authorContent = `<p class="author-name">${post.author?.username}</p><p>${post.timestamp}</p>`
  const htmlContent = marked.parse(post.content) + authorContent;

  // Create a foreignObject element to embed HTML within SVG
  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

  // Set initial width and height to allow content to dictate the size
  const initialWidth = 300; // Set an initial width (adjust as needed)
  const initialHeight = 200; // Set an initial height (adjust as needed)
  foreignObject.setAttribute("width", initialWidth);
  foreignObject.setAttribute("height", initialHeight);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", foreignObject.getAttribute("width"));
  rect.setAttribute("height", foreignObject.getAttribute("width"));
  rect.setAttribute("fill", "#69b3a2");

  // Create a div to hold the HTML content
  const div = document.createElement("div");
  //TODO Find a better way to do this, div's don't have an onload event, so another element?
  setTimeout(() => {
    // console.log(div);
    const { scrollWidth, scrollHeight } = div;
    foreignObject.setAttribute("width", scrollWidth);
    foreignObject.setAttribute("height", scrollHeight);
    rect.setAttribute("width", scrollWidth);
    rect.setAttribute("height", scrollHeight);
  }, 200);
  div.innerHTML = htmlContent;

  // Append the div to the foreignObject
  foreignObject.appendChild(div);


  // Append the foreignObject to the postContainer
  postContainer.appendChild(foreignObject);
  postContainer.insertBefore(rect, postContainer.firstChild);


  // Add event listener for post selection
  postContainer.addEventListener("click", (event) => {
    if (event.shiftKey) {
      // Add or remove from selection with shift + click
      if (selectedPosts.includes(post)) {
        selectedPosts = selectedPosts.filter((selectedPost) => selectedPost !== post);
      } else {
        selectedPosts.push(post);
      }
    } else {
      // Single click selection
      if (selectedPosts.length === 1 && selectedPosts[0] === post) {
        // Deselect the post if it was already selected
        selectedPosts = [];
      } else {
        selectedPosts = [post];
      }
    }

    // Update the selection state of the post element
    updatePostSelection();
  });

  return postContainer;
}

function createMarkerDefs() {
  // Create a marker for the arrowhead
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");

  // Create a path for the arrowhead shape
  const arrowheadPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowheadPath.setAttribute("d", "M0,0 L0,6 L9,3 z");
  arrowheadPath.style.fill = "#aaa";

  // Append the arrowhead path to the marker
  marker.appendChild(arrowheadPath);
  defs.appendChild(marker);

  return defs;
}

function createLinkElement() {
  const link = document.createElementNS("http://www.w3.org/2000/svg", "line");
  link.setAttribute("marker-end", "url(#arrowhead)");
  link.style.stroke = "#aaa";
  return link;
}

var simulation;
var svg;

function clearSVG() {
  // Select the SVG container
  const svgContainer = d3.select("#posts > g");

  // Clear the SVG container by setting its HTML content to an empty string
  svgContainer.html("");
}

function loadPosts() {
  clearSVG();

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

      const postElements = posts.map(createPostElement);
      const linkElements = links.map(createLinkElement);

      // Create the D3 force simulation
      simulation = d3.forceSimulation(posts)
        .force("link", d3.forceLink(links).id(d => d.id).distance(500))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));


      const markerDefs = createMarkerDefs();

      // Create the SVG container for the graph
      svg = d3.select("#posts")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .call(d3.zoom().on("zoom", function (event) {
          svg.attr("transform", event.transform);
        }))
      .append("g");

      // Add a 'defs' element to your SVG
      let defs = svg.append('defs');

      // Define the arrow markers
      defs.selectAll('marker')
          .data(['end'])
          .enter()
          .append('marker')
          .attr('id', String)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 15) // Controls the shift of the arrowhead along the line
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 12)
          .attr('markerHeight', 12)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#000')
          .style('stroke','none');


      // Append the marker definitions to the SVG
      // svg.append(() => markerDefs);
      // Create the link elements
      const link = svg.selectAll("line")
        .data(links)
        .enter()
        .append(() => linkElements.shift())
        .attr('marker-end', 'url(#end)');

      // Create the node elements as rectangles
      const node = svg.selectAll("g")
        .data(posts)
        .enter()
        .append(() => postElements.shift())
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      // Update the positions of nodes and links on each tick
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

          node
          .attr("transform", d => `translate(${d.x}, ${d.y})`)
          .classed("dragging", d => selectedPosts.includes(d));
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
  const outgoingLinks = form.elements.outgoingLinks.value;

  const data = { content, outgoingLinks};

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

function deletePost(event) {
  event.preventDefault();

  if (selectedPosts.length == 0) {
    return;
  }
  // const ids = selectedPosts;
  const linkedPostIds = selectedPosts.map(post => post.id);

  const data = { ids : linkedPostIds };

  fetch('/api/posts', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(() => {
      loadPosts();  // Reload the posts after a new one is created
    })
    .catch((error) => {
      console.error('Error deleting posts:', error);
    });
}


function expand(event) {
  event.preventDefault();

  if (selectedPosts.length != 1) {
    return;
  }
  const selectedPostId = selectedPosts.map(post => post.id);

  fetch(`/api/expand/${selectedPostId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(() => {
      loadPosts();  // Reload the posts after a new one is created
    })
    .catch((error) => {
      console.error('Error deleting posts:', error);
    });
}


// Initial load of posts
loadPosts();

// Close modal on initial page load
closeModal();

window.addEventListener("resize", function() {
  svg.attr("width", window.innerWidth).attr("height", window.innerHeight)
  simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
  simulation.restart();

});
