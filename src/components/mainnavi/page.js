import Link from "next/link";
import styled from "styled-components";
import {roboto_condensed} from "@/app/fonts";
export default function MainNavi() {
    return (
        <StyledNav>
            <StyledList className={roboto_condensed.className}>
                <li><Link href='/about-me' title='Homepage'>About me</Link></li>
                <li><Link href='/' title='Homepage'>Vita</Link></li>
                <li><Link href='/' title='Homepage'>Showcase</Link></li>
                <li><Link href='/imprint' title='Homepage'>Imprint</Link></li>
            </StyledList>
        </StyledNav>
    )
}

const StyledNav = styled.nav`
  
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 10px 10px 3px;
  display: flex;
  border-bottom: 1px solid rgba(98, 131, 149, 1);
  
  li + li:before {
    content: "|";
    color: rgba(98, 131, 149, 1);
    font-size: 28px;
    font-weight: 200;
    position: relative;
    top: -2px;
  }
  li {
    line-height: 28px;
    
    a {
      padding: 0 10px;
      text-transform: uppercase;
      color: rgba(98, 131, 149, 1);
      font-size: 28px;
      font-weight: 200;

      &:hover {
        color: rgba(206, 71, 96, 1);
      }
    }
  }
`;