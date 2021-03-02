var app = new Vue({
  el: "#app",
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
