import styled from "styled-components";
import Link from "next/link";

export const ContactBtn = styled(Link)`
    border: none;
    background: rgba(189, 51, 80, 1); /* Marken-Rot (#bd3350): weißer Text darauf = 5.6:1 → WCAG-AA */
    color: #ffffff;
    text-transform: uppercase;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 300ms ease-in-out;
    max-height: 45px;
    &.is-mobile {
      margin-right: 45px;
    }
  
    &:hover {
        background: rgba(162, 31, 55, 1);
    }
`;