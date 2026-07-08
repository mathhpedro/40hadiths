/** Ambient, refractive backdrop the glass surfaces sit over. */
export function Background() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg__blob app-bg__blob--a" />
      <div className="app-bg__blob app-bg__blob--b" />
      <div className="app-bg__blob app-bg__blob--c" />
      <div className="app-bg__pattern" />
    </div>
  )
}
