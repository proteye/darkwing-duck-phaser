export const loadFont = (name: string, url: string) => {
  const newFont = new FontFace(name, `url(${url})`)

  newFont
    .load()
    .then(function (loaded) {
      document.fonts.add(loaded)
    })
    .catch(function (error) {
      return error
    })
}
