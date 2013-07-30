if (!process.env.NODE_PATH) {
  console.log("Can't found NODE_PATH.");
  console.log('Please install spm first, and set a NODE_PATH.');
  process.exit(1);
}
