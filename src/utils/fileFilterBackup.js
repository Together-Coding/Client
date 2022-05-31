/*const fileclassification = (userFile) => {
    let copy = [...userFile];
    console.log(copy);
    let newArr = copy.reduce((res, path) => {
      let convertArr = path.split("/");
      let parent = res;
      let treePath = convertArr.forEach((ele) => {
        let temParent = parent.find((el) => el.path === ele);
        if (!temParent) {
          let tmp = { path: ele, children: [] };
          parent.push(tmp);
          parent = tmp.children;
        } else {
          parent = temParent.children;
        }
      });
      return res;
    }, []);
    setUserFile((prev) => {
      return newArr;
    });
  };

  let lastFilterFile = [];
  let filePath;
  const treeSearch = (array) => {
    array.map((i) => {
      if (i.children.length === 0) {
        
        let file = { type: "file", name: i.path, path:filePath+"/"+i.path};
        lastFilterFile.push(file);
        //setLastFilterFile([...lastFilterFile, file]);
      } else if (i.children.length > 0) { 
        filePath=i.path
        let dir = { type: "dir", name: i.path, path:i.path };
        lastFilterFile.push(dir);
        
        //setLastFilterFile([...lastFilterFile, dir]);
        treeSearch(i.children);
      }
    });
    filePath=""
  };

  et files = [
    { folder: [{ folder2: ["hihi.txt"] }, "empty_file.txt", "inner file.txt"] },
    "user16.txt",
    "reagjjjd.md",
  ];

  let files2 = [
    "folder/empty_file.txt",
    "folder/inner file.txt",
    "user16.txt",
    "reagjjjd.md",
    "folder/folder2/hi.txt",
  ];

  let newArr = files2.reduce((res, path) => {
    let convertArr = path.split("/");
    let parent = res;
    let treePath = convertArr.forEach((ele) => {
      let temParent = parent.find((el) => el.path === ele);
      if (!temParent) {
        let tmp = { path: ele, children: [] };
        parent.push(tmp);
        parent = tmp.children;
      } else {
        parent = temParent.children;
      }
    });
    return res;
  }, []);
  */