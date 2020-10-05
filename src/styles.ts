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

  .grid-header {
    visibility: hidden;
    grid-column-start: 1;
    grid-column-end: 4;
    height: 0;
  }

  #ratio,
  #autarky {
    margin: 0;
    text-align: center;
  }

  .bar-container {
    grid-column: 2;
    grid-row-start: 2;
    grid-row-end: 4;

    display: flex;
    flex-wrap: wrap;
    height: 100%;
  }

  .bar-container > div {
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

  badge {
    width: 50%;
    border: gray 1px solid;
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
  @media not screen and (max-width: 450px) {
    item:nth-child(2n) > badge {
      float: right;
    }
    item:nth-child(2n) > value {
      float: left;
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
      border-left-color: var(--switch-unchecked-button-color);
      border-right-color: var(--switch-unchecked-button-color);
    }
    33% {
      border-left-color: var(--switch-unchecked-track-color);
      border-right-color: var(--switch-unchecked-track-color);
    }
  }

  #arrow_1,
  #arrow_2,
  #arrow_3 {
    border-left-color: var(--switch-unchecked-track-color);
    border-right-color: var(--switch-unchecked-track-color);
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
