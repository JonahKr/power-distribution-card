import { css } from 'lit-element';

export const styles = css`
  * {
    box-sizing: border-box;
  }

  p {
    margin: 4px 0 4px 0;

    text-align: center;
  }

  .card-content {
    display: grid;
    overflow: auto;

    grid-template-columns: 1.5fr 1fr 1.5fr;
    column-gap: 10px;
  }

  #mid-panel {
    display: flex;

    height: 100%;

    align-items: center;
    justify-content: center;
    grid-column: 2;
    flex-wrap: wrap;
  }

  #mid-panel > div {
    display: flex;
    overflow: hidden;

    width: 100%;
    height: 80%;
    max-height: 200px;

    flex-basis: 50%;
    flex-flow: column;
  }

  #mid-panel > div > p {
    flex: 0 1 auto;
  }

  .bar-wrapper {
    position: relative;

    width: 50%;
    height: 80%;
    margin: auto;

    flex: 1 1 auto;
  }

  bar {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
  }

  item {
    display: block;
    overflow: hidden;

    margin-bottom: 10px;

    cursor: pointer;
  }

  #right-panel > item > value {
    float: left;
  }

  #right-panel > item > badge {
    float: right;
  }

  badge {
    float: left;

    width: 50%;
    padding: 4px;

    border: 1px solid;
    border-color: var(--disabled-text-color);
    border-radius: 1em;
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

  /**********
  Mobile View
  **********/
  @media only screen and (max-width: 450px) {
    .card-content {
      grid-template-columns: 1fr 1fr 1fr;
    }
    item > badge,
    item > value {
      display: block;
      float: none !important;

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
    width: 54px;
    height: 4px;
    margin: 8px auto 8px auto;

    opacity: 0.3;
    background-color: var(--secondary-text-color);
  }

  .triangle-right {
    width: 0;
    height: 0;

    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 17px solid;
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
      border-right-color: var(--secondary-text-color);
      border-left-color: var(--secondary-text-color);
    }
    33% {
      opacity: 0.8;
      border-right-color: var(--secondary-text-color);
      border-left-color: var(--secondary-text-color);
    }
  }

  #arrow_1,
  #arrow_2,
  #arrow_3 {
    opacity: 0.3;
    border-right-color: var(--secondary-text-color);
    border-left-color: var(--secondary-text-color);
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
