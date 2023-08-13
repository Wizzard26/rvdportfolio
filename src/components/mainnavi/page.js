'use client';

import { usePathname } from 'next/navigation';
import Link from "next/link";
import styled from "styled-components";
import { roboto_condensed } from "@/app/fonts";
export default function MainNavi() {
    const currentRoute = usePathname();

    return (
        <StyledNav>
            <StyledList className={roboto_condensed.className}>
                <li><Link href='/about-me' title='Homepage'
                    className={currentRoute === "/about-me"
                      ? "is--active"
                      : " "}
                >About me</Link></li>
                <li><Link href='/vita' title='Homepage'
                    className={currentRoute === "/vita"
                      ? "is--active"
                      : " "}
                >Vita</Link></li>
                <li><Link href='/showcase' title='Homepage'
                    className={currentRoute === "/showcase"
                      ? "is--active"
                      : " "}
                >Showcase</Link></li>
                <li><Link href='/imprint' title='Homepage'
                    className={currentRoute === "/imprint"
                      ? "is--active"
                      : " "}
                >Imprint</Link></li>
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
  border-bottom: 1px solid var(--primary);
  
  li + li:before {
    content: "|";
    color: var(--primary);
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
      color: var(--mainNav);
      font-size: 28px;
      font-weight: 200;

      &:hover {
        color: var(--secondary);
      }
      
      &.is--active {
        color: var(--secondary);
        
        &:hover {
          color: var(--secondary-dark);
        }
      }
    }
  }
`;