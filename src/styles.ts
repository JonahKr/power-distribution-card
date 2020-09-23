import { css } from 'lit-element';

export const styles = css`
  * {
    box-sizing: border-box;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1.5fr;
    gap: 10px;
    margin: auto;
  }

  p {
    text-align: center;
    margin: 4px 0 4px 0;
  }

  .grid-header {
    visibility: hidden;
    grid-column-start: 1;
    grid-column-end: 4;
    height: 0;
  }

  .overview {
    grid-column: 2;
    grid-row-start: 2;
    grid-row-end: 4;
  }

  #ratio,
  #autarky {
    margin: 0;
    text-align: center;
  }

  .bar-container {
    display: flex;
    flex-wrap:wrap;
    height: 100%;
  }

  .bar-container > div {
    flex-basis:50%;
    display: flex;
    flex-flow: column;
    vertical-align: middle;
  }

  .bar-container > div > p {
    flex: 0 1 auto;
  }

  .bar-wrapper {
    flex: 1 1 auto;
    position: relative;
  }ight: calc(100% - 28px);
  }

  bar {
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    margin: auto;
    width: 50%;
  }

  badge {
    width: 50%;
    border: gray 1px solid;
    border-radius: 1em;
    float: left;
    padding: 4px;
  }

  badge > icon {
    width: 100%;
    display: inline-block;
  }

  icon > ha-icon {
    display: block;
    width: 24px;
    margin: 0 auto;
    color: var(--paper-item-icon-color)
  }

  value {
    float: right;
  }

  item:nth-child(2n) > badge {
    float: right;
  }

  item:nth-child(2n) > value {
    float: left;
  }

  /**************
ARROW ANIMATION
**************/
  .arrow > div {
    display: inline-block;
  }

  .blank {
    height: 4px;
    width: 54px;
    background-color: var(--secondary-background-color);
    margin: 8px auto 8px auto;
  }

  .triangle-right {
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-left: 17px solid var(--secondary-background-color);
    border-bottom: 8px solid transparent;
  }

  .triangle-left {
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-right: 17px solid var(--secondary-background-color);
    border-bottom: 8px solid transparent;
  }

  @keyframes flash_triangles {
    0%,
    66% {
      border-left-color: var(--secondary-background-color);
      border-right-color: var(--secondary-background-color);
    }
    33% {
      border-left-color: var(--primary-color);
      border-right-color: var(--primary-color);
      filter: grayscale(1);
    }
  }
  #arrow_1 {
    animation: flash_triangles 3s infinite steps(1);
  }

  #arrow_2 {
    animation: flash_triangles 3s infinite 1s steps(1);
  }

  #arrow_3 {
    animation: flash_triangles 3s infinite 2s steps(1);
  }
`;

export default styles;
