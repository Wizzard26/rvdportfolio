'use client';
import { roboto, roboto_condensed } from "@/app/fonts";
import Link from "next/link";
import styled, { css } from "styled-components";
import MainNavi from "@/components/mainnavi/page";
import { ContactBtn } from "@/components/ContactBtn";
import StyledComponentsRegistry from "@/lib/registry";
import {useEffect, useState} from "react";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [mobile, setMobile] = useState(false);

    const handleToogle = () => {
        setOpen(!open);
    }

    useEffect(() => {
        const handleMobile = () => {
            const screenWith = window.innerWidth;
            screenWith < 1024 ? setMobile(!mobile) : setMobile(mobile);
        }
        handleMobile();
        window.addEventListener('resize', handleMobile);
    },[]);


    return (
        <>
            <StyledComponentsRegistry>
                <Topbar />
                <StyledHeader>
                    <HeaderInner className="content-inner">
                        <LogoLink href="/" alt="go to main">
                            <LogoName className={roboto_condensed.className}>René van Dinter</LogoName>
                            <LogoTitle className={roboto.className}>Mediengestalter Digital und Print</LogoTitle>
                            <LogoSubTitle className={roboto.className}>Web-Frontend-Developer</LogoSubTitle>
                        </LogoLink>
                        <MainNavi />
                        <ContactBtn href="./contact">Contact me</ContactBtn>
                        {mobile &&
                            <StyledNavBtn onClick={handleToogle} className={`${open ? 'isOpen' : ''}`}>
                                <StyledBurgerBars className={'top'}/>
                                <StyledBurgerBars className={'middle'}/>
                                <StyledBurgerBars className={'bottom'}/>
                            </StyledNavBtn>
                        }
                        {open && <StyledOverlay onClick={handleToogle}></StyledOverlay>}
                    </HeaderInner>
                </StyledHeader>
            </StyledComponentsRegistry>
        </>
    )
}

const StyledHeader = styled.header`
  background-color: var(--light);
  width: 100%;
  padding: 20px 0;
`;

const Topbar = styled.div`
  height: 30px;
  width: 100%;
  background-color: var(--dark-6);
`;

const HeaderInner = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
`;

const LogoLink = styled(Link)`
  display: flex;
  flex-direction: column;
  color: var(--logo);
`;

const LogoName = styled.div`
  font-weight: 400;
  font-size: 26px;
  line-height: 24px;
`;

const LogoTitle = styled.div`
  font-weight: 200;
  font-size: 16px;
  line-height: 14px;
`;

const LogoSubTitle = styled.div`
  font-weight: 200;
  font-size: 16px;
  line-height: 14px;
`;

const StyledOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  background-color: rgba(32,32,32, 0.6);
`;

const StyledNavBtn = styled.div`
    display: block;
  
`;

const StyledBurgerBars = styled.div`
  width: 2rem;
  height: 0.25rem;
  background: #4f4f4f;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
  margin: 5px 0;
`;

