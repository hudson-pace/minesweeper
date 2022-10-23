export default function Tile(props) {
  let classes = `tile`;
  if (!props.exposed) {
    classes += ' unseen';
    if (props.flagged) {
      classes += ' flagged';
    }
  } else if (props.value > 0) {
    classes += ` mines-${props.value}`;
  }
  return (
    <div className={`tile-container ${props.shape}`}
      onContextMenu={(e) => props.onContextMenu(e, props.index)}
      onClick={(e) => props.onClick(e, props.index)}
    >
      <div className={classes}>
          <div>{props.value !== 0 ? props.value : ''}</div>
      </div>
    </div>
  )
}