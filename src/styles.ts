import { css } from 'lit-element';

export const styles = css`
  * {
    box-sizing: border-box;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1.5fr;
    gap: 10px;
  }

  p {
    text-align: center;
    margin: 4px 0 4px 0;
  }

  #ratio,
  #autarky {
    margin: 0;
    text-align: center;
  }

  .bar-container {
    grid-column: 2;
    grid-row: 1/20;
    display: flex;
    flex-wrap: wrap;
    height: 100%;
  }

  .bar-container > div {
    height: minmax();
    flex-basis: 50%;
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
    width: 50%;
    margin: auto;
  }

  bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .item_0 {
    grid-column: 1;
  }

  .item_1 {
    grid-column: 3;
  }

  badge {
    width: 50%;
    border: 1px solid;
    border-color: var(--disabled-text-color);
    border-radius: 1em;
    float: left;
    padding: 4px;
  }

  icon > ha-icon {
    display: block;
    width: 24px;
    margin: 0 auto;
    color: var(--paper-item-icon-color);
  }

  value {
    float: right;
  }

  .item_1 > value {
    float: left;
  }

  .item_1 > badge {
    float: right;
  }

  .pointer {
    cursor: pointer;
  }

  /**********
  Mobile View
  **********/
  @media only screen and (max-width: 450px) {
    .grid-container {
      grid-template-columns: 1fr 1fr 1fr;
    }
    item > badge,
    item > value {
      display: block;
      float: none;
      width: 72px;
      margin: 0 auto;
    }

    .arrow {
      width: max-content;
      margin: 0 auto;
    }
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
    opacity: 0.3;
    background-color: var(--secondary-text-color);
    margin: 8px auto 8px auto;
  }

  .triangle-right {
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-left: 17px solid;
    border-bottom: 8px solid transparent;
  }

  .triangle-left {
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-right: 17px solid;
    border-bottom: 8px solid transparent;
  }

  @keyframes flash_triangles {
    0%,
    66% {
      opacity: 0.3;
      border-left-color: var(--secondary-text-color);
      border-right-color: var(--secondary-text-color);
    }
    33% {
      opacity: 0.8;
      border-left-color: var(--secondary-text-color);
      border-right-color: var(--secondary-text-color);
    }
  }

  #arrow_1,
  #arrow_2,
  #arrow_3 {
    opacity: 0.3;
    border-left-color: var(--secondary-text-color);
    border-right-color: var(--secondary-text-color);
  }

  #arrow_1.animated {
    animation: flash_triangles 3s infinite steps(1);
  }

  #arrow_2.animated {
    animation: flash_triangles 3s infinite 1s steps(1);
  }

  #arrow_3.animated {
    animation: flash_triangles 3s infinite 2s steps(1);
  }
`;

export default styles;
