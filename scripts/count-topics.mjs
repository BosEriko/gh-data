import fs from "fs";
import fetch from "node-fetch";

const username = "BosEriko";
const token = process.env.GITHUB_TOKEN;

const allowedTopics = JSON.parse(
  fs.readFileSync("topics.json", "utf-8")
);

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
};

async function fetchAllRepos() {
  let page = 1;
  let repos = [];

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
      { headers }
    );

    const data = await res.json();
    if (data.length === 0) break;

    repos.push(...data);
    page++;
  }

  return repos;
}

async function fetchTopics(repo) {
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo.name}/topics`,
    { headers }
  );

  const data = await res.json();
  return data.names || [];
}

async function main() {
  const repos = await fetchAllRepos();
  const counts = {};

  for (const lang of allowedTopics) {
    counts[lang] = 0;
  }

  for (const repo of repos) {
    const topics = await fetchTopics(repo);

    const hasProjectOrProduct =
      topics.includes("project") || topics.includes("product");

    if (!hasProjectOrProduct) continue;

    for (const lang of allowedTopics) {
      if (topics.includes(lang)) {
        counts[lang]++;
      }
    }
  }

  // Sort counts from highest to lowest
  const sortedCounts = Object.fromEntries(
    Object.entries(counts).sort((a, b) => b[1] - a[1])
  );

  fs.writeFileSync("topic-count.json", JSON.stringify(sortedCounts, null, 2));
  console.log("Updated topic-count.json:", sortedCounts);
}

main();
