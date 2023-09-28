import { PostType, getPosts, updatePost } from './db/posts.js';


export const JobState = {
  Scheduled: 1,
  Running: 2,
}

export const StepType = {
  Query: 1,
  Running: 2,
  Email: 3,
}

// At the application startup
async function fetchJobs() {
  const jobs = await getPosts({ type : PostType.Job });
  
  console.log("Fetched jobs: " + jobs.length);

  const parsedJobs = jobs.map((job) => JSON.parse(job.content));

  //Job schema reference
  const jobSchema = {
    "state": JobState.Scheduled,
    "name": "ExampleJob",
    "schedule": {
      "frequency": 600, //Run interval in seconds
      "runTime": "5", //Runtime in seconds
      "lastRunAt": "2023-06-12T12:00:00Z",
      "nextRunAt": "2023-06-13T12:00:00Z"
    },
    "steps": [
      {
        "name": "Step 1",
        "type": StepType.Query
      },
      {
        "name": "Step 2",
        "type": "task"
      }
    ]
  }
  
}




  // jobs.forEach(job => {
  //   // Schedule each job based on its frequency
  //   scheduleJob(job.name, job.frequency, async () => {
  //     // Update the job state to running
  //     await prisma.jobs.update({
  //       where: { id: job.id },
  //       data: { state: 'Running', lastRunAt: new Date() },
  //     });

  //     // Define the job steps here
  //     // Since you said that the jobs are a type of post, you'll need to make the required HTTP requests
  //     // to your post route. Here I'm assuming each step is a URL to a post route and I'm making a POST request to it.
  //     // You can update this based on your requirements.
  //     for(const step of job.steps) {
  //       await axios.post(step.url, step.data);
  //     }

  //     // After the job is done, update the job state back to idle
  //     await prisma.jobs.update({
  //       where: { id: job.id },
  //       data: { state: 'Idle' },
  //     });
  //   });
  // });


fetchJobs();
console.log("Jobs running");

