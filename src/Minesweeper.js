import { useState } from "react";
import Grid from './Grid';

const shapes = ['triangle', 'square', 'hexagon', 'octagon'];
export default function Minesweeper(props) {
  const [shape, setShape] = useState('triangle');
  const [size, setSize] = useState(5);
  const [mineCount, setMineCount] = useState(5);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [interval, setInterval] = useState(100);
  const [guaranteedSolvable, setGuaranteedSolvable] = useState(false);

  return (
    <>
      <h5>Note: This project has largely been replaced by <a href="https://hudson-pace.github.io/shape-editor">this one</a>.</h5>
      <div className="control-panel">
        {
          shapes.map((shape) => {
            return (
              <label key={shape}>
                <input type="radio" id={`shape-${shape}`} name="shape" value={shape} defaultChecked={shape === 'triangle'} onChange={e => setShape(e.target.value)}></input>{shape}
              </label>
            );
          })
        }
        <br />
        <label>
          size:<input type="number" id="size" name="size" value={size} min={5} max={20} onChange={e => setSize(parseInt(e.target.value))}></input>
        </label>
        <br />
        <label>
          mine count:<input type="number" id="mineCount" name="mineCount" value={mineCount} min={1} max={size * size / 2} onChange={e => setMineCount(parseInt(e.target.value))}></input>
        </label>
        <br />
        <label>
          autoplay:<input type="checkbox" name="shouldAutoplay" value={shouldAutoplay} onChange={e => setShouldAutoplay(e.target.value)}></input>
        </label>
        <br />
        <label>
          autoplay interval (ms):<input type="number" name="interval" value={interval} min={10} onChange={e => setInterval(parseInt(e.target.value))}></input>
        </label>
        <br />
        <label>
          always solvable:<input type="checkbox" name="guaranteedSolvable" value={guaranteedSolvable} onChange={e => setGuaranteedSolvable(e.target.value)}></input>
        </label>
      </div>
      <Grid
        width={shape === 'octagon' ? size * 2 + 1 : size}
        height={shape === 'octagon' ? size * 2 + 1 : size}
        mineCount={mineCount}
        shouldAutoplay={shouldAutoplay}
        interval={interval}
        guaranteedSolvable={guaranteedSolvable}
        shape={shape}
      />
    </>
  )
}