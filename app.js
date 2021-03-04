var app = new Vue({
  el: "#app",
  components: {
    "image-preview": imageComponent,
  },
  data: {
    dragging: false,
    imageArr: [],
    imageDownArr: [],
    i: 0,
    k: 0,
  },
  created() {
    this.registerHandlers();
  },
  methods: {
    handleFiles(e) {
      this.prepareFiles(e.target.files);
    },
    prepareFiles(files) {
      files = [...files];
      files.forEach(this.organizeFile);
    },
    organizeFile(file) {
      let fileName = file.name;

      if (
        this.$data.imageDownArr.length != 0 &&
        this.findDuplicate(this.$data.imageDownArr, file) != undefined
      ) {
        fileName =
          file.name.substring(0, file.name.lastIndexOf(".")) +
          ` (${this.$data.k})` +
          file.name.substring(file.name.lastIndexOf("."));
        this.$data.k++;
      }

      var canvasData = this.getCanvasData(
        "canvas-id-" + this.$data.i,
        URL.createObjectURL(file),
        fileName
      );
      this.pushCanvasData(canvasData, this.$data.imageArr);

      var resultCanvasData = this.getCanvasData(
        "canvas-id-" + this.$data.i,
        "",
        fileName
      );
      this.pushCanvasData(resultCanvasData, this.$data.imageDownArr);

      this.$data.i++;
    },
    restoreDownloadButton() {
      const downloadProgress = document.getElementById("download");
      downloadProgress.disabled = false;
      downloadProgress.innerHTML = "Загрузить ещё";
    },
    downloadResult() {
      const downloadProgress = document.getElementById("download");
      downloadProgress.disabled = true;
      downloadProgress.innerHTML = "Загрузка...";

      if (this.$data.imageArr.length == 1) {
        const item = this.$data.imageArr[0];
        const gCanvas = document.getElementById(item.cid);
        gCanvas.toBlob((blob) => {
          const a = document.createElement("a");
          document.body.append(a);
          a.download =
            "MacPic-" + item.fname.substring(0, item.fname.lastIndexOf("."));
          a.href = URL.createObjectURL(blob);
          a.click();
          a.remove();
          this.restoreDownloadButton();
        });
      } else {
        var zip = new JSZip();
        var fileTasks = [];
        this.$data.imageArr.forEach((item) => {
          let gCanvas = document.getElementById(item.cid);
          let task = new Promise((resolve, reject) => {
            gCanvas.toBlob((blob) => {
              let fileName = item.fname.substring(
                0,
                item.fname.lastIndexOf(".")
              );
              zip.file(`macshell-${fileName}.png`, blob);
              resolve();
            });
          });
          fileTasks.push(task);
        });

        Promise.all(fileTasks).then(() => {
          zip.generateAsync({ type: "blob" }).then((content) => {
            const timestamp = Date.now().toString();
            saveAs(content, `macshell-${timestamp}.zip`);
            this.restoreDownloadButton();
          });
        });
      }
    },
    getCanvasData(canvasId, fileLink, fileName) {
      return {
        cid: canvasId,
        flink: fileLink,
        fname: fileName,
      };
    },
    pushCanvasData(canvasData, array) {
      array.push(canvasData);
    },
    findDuplicate(imageDownArr, file) {
      return imageDownArr.find((item) => {
        let fileName1 = item.fname
          .substring(0, item.fname.lastIndexOf("."))
          .toLowerCase();

        let fileName2 = file.name
          .substring(0, file.name.lastIndexOf("."))
          .toLowerCase();

        return fileName1 == fileName2;
      });
    },
    preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    registerHandlers() {
      window.ondrop = (event) => {
        event.preventDefault();
        this.prepareFiles(event.dataTransfer.files);
      };

      window.addEventListener(
        "paste",
        (e) => {
          this.prepareFiles(e.clipboardData.files);
        },
        false
      );

      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        window.addEventListener(eventName, this.preventDefaults, false);
      });
    },
  },
});
