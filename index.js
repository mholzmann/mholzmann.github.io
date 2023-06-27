let images = new Map();
let fileEntry, directoryEntry;
let droppedItems = false;

document.querySelector(".dropzone").addEventListener("dragover", (event) => event.preventDefault());

document.querySelector(".dropzone").addEventListener("drop", (event) => {
  event.preventDefault();
  droppedItems = true;
  readEntries([...event.dataTransfer.items].map(item => item.webkitGetAsEntry()));
});

/**
 * 
 * @param {FileSystemEntry[]} entries 
 */
function readEntries(entries) {
  fileEntry = undefined;
  directoryEntry = undefined;
  console.log(entries);
  for (const entry of entries) {
    if (entry && entry.isFile && entry.name.endsWith(".md") && (!fileEntry || entry.name.toLowerCase() === "readme.md")) {
      fileEntry = entry;
    } else if (entry && entry.isDirectory && (!directoryEntry || entry.name === "pics")) {
      directoryEntry = entry;
    }
  }
  if (directoryEntry && fileEntry) {
    readImages(directoryEntry);
    readMarkdown(fileEntry);
  } else if (fileEntry) {
    readMarkdown(fileEntry);
    return;
  } else if (directoryEntry) {
    const directoryReader = directoryEntry.createReader();
    directoryReader.readEntries((entries) => readEntries(entries));
  }
}

/**
 * 
 * @param {FileSystemFileEntry} file 
 */
function readMarkdown(fileEntry) {
  setTimeout(() => {
    fileEntry.file((file) => {
      const fileReader = new FileReader();
      fileReader.onload = (ev) => showSlides(ev.target.result);
      fileReader.readAsText(file, "UTF-8");
    });
  }, 500);
}

/**
 * 
 * @param {FileSystemDirectoryEntry} directoryEntry 
 */
function readImages(directoryEntry) {
  images.clear();
  const directoryReader = directoryEntry.createReader();
  directoryReader.readEntries((entries) => {
    for (const entry of entries) {
      entry.file((file) => images.set(file.name, URL.createObjectURL(file)));
    }
  });
}

/**
 * 
 * @param {string} markdown 
 */
function showSlides(markdown) {
  markdown = markdown.replace(/\n-/g, "\n\n-");
  markdown = markdown.replace(/\n\040\040-/g, "\n\n  -");
  markdown = markdown.replace(/\n\040\040\040\040-/g, "\n\n    -");
  markdown = markdown.replace(/:(?=[*_])/g, "\\:");
  // markdown = markdown.replace(/:(?<=\>\s*.*)/g, "\\:")
  markdown = replaceSlideBreaks(markdown);
  markdown = markdown.replace(/##/g, "\n---\n##");
  markdown = markdown.replace(/!\[.*\)/g, (substring) => {
    const imageName = substring.split("/")[1].slice(0, -1);
    return `![img](${images.get(imageName)})`;
  });
  console.log(markdown);
  console.log("end");
  Reveal.destroy();
  document.querySelector(".slides").innerHTML = `
    <section  data-markdown data-separator="\n---\n">
      <textarea class="markdown" data-template>
        ${markdown}
      </textarea>
    </section>`;
  
  
  Reveal.initialize({
    hash: true,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
  });
  if (droppedItems) {
    Reveal.slide(0);
    droppedItems = false;
  } else {
    Reveal.slide(Reveal.getIndices().h);
  }
}

function replaceSlideBreaks(markdown) {
  let index = markdown.search(/<!---->/g);
  while (index > 0) {
    const before = markdown.slice(0, index);
    const after = markdown.slice(index+7);
    const regex = /##.*/g;
    let heading = "";
    let searchResult;
    while ((searchResult = regex.exec(before)) !== null) {
      heading = searchResult[0];
    }
    markdown = `${before}${heading}\n${after}`
    index = markdown.search(/<!---->/g);
  }
  return markdown;
}

function reloadSlides() {
  readEntries([directoryEntry, fileEntry]);
}