'use client';

import { usePathname } from 'next/navigation';
import { NavMenu } from '@/lib/pages';
import Link from "next/link";
import styled from "styled-components";
import { roboto_condensed } from "@/app/fonts";

export default function MainNavi({isOpen, isMobile, onToogle}) {
    const currentRoute = usePathname();

    return (
        <StyledNav
            className={`${isOpen ? 'nav-open': ''} ${isMobile ? 'nav-mobile': 'nav-desktop'}`}
            onClick={isMobile ? onToogle : null}
        >
            <StyledList className={roboto_condensed.className}>
                {NavMenu.map((navitem) => (
                    navitem.hideTop !== true &&
                        <li key={navitem.label}>
                            <Link href={navitem.href} title={navitem.title}
                                  className={currentRoute === navitem.href
                                      ? "is--active"
                                      : " "}
                            >
                                {navitem.label}
                            </Link>
                        </li>
                ))}
            </StyledList>
        </StyledNav>
    )
}

const StyledList = styled.ul`
  list-style: none;
  padding: 10px 10px 3px;
  display: flex;
  
  
  li {
    a {
      text-transform: uppercase;
      color: var(--mainNav);
      font-size: 28px;
      font-weight: 200;
      position: relative;

      &.is--active {
        color: var(--secondary);
      }
    }
  }
`;

const StyledNav = styled.nav`
  
    &.nav-mobile {
      position: fixed;
      z-index: 100;
      width: 96%;
      top: 120px;
      transform: translateX(110%);
      transition: transform 500ms ease-in-out;
      justify-content: center;
      
      ul {
        flex-direction: column;
        align-items: center;
        border:0;

        li + li:before {
          display: none;
        }

        li {
          line-height: 55px;
          
          a {
            font-size: 34px;
          }
        }
      }
      
      &.nav-open {
        transform: translateX(0);
      }
    }

    &.nav-desktop {
      ul {
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: var(--primary);

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

            &:after {
              height: 3px;
              width: 0;
              content: "";
              display: block;
              background: var(--secondary);
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              transition: width 300ms ease-in-out;
            }

            &:hover {
              color: var(--secondary);

              &:after {
                width: calc(100% - 20px);
              }
            }

            &.is--active {
              &:after {
                width: calc(100% - 20px);
              }

              &:hover {
                color: var(--secondary-dark);

                &:after {
                  background: var(--secondary-dark);
                }
              }
            }
          }
        }
      }
    }
`;