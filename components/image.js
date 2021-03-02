var imageComponent = {
  data: {
    item: {}
  },
  created() {
    this.$data.item.img = new Image();
    this.$data.item.img.src = this.$data.item.flink;
    this.$data.item.img.onload = () => this.drawImage(gCanvas, item);
  }
}