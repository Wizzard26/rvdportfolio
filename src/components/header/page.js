'use client';
import { roboto, roboto_condensed } from "@/app/fonts";
import Link from "next/link";
import styled, { css } from "styled-components";
import MainNavi from "@/components/mainnavi/page";
import { ContactBtn } from "@/components/ContactBtn";
import StyledComponentsRegistry from "@/lib/registry";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [mobile, setMobile] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);

    const handleToogle = () => {
        setOpen(!open);
        if(open) {
            setTimeout(() => {
                setShowOverlay(false);
            }, 400);
        } else {
            setShowOverlay(true);
        }
    }

    useEffect(() => {
        const handleMobile = () => {
            const screenWith = window.innerWidth;
            screenWith < 1024 ? setMobile(mobile) : setMobile(!mobile);
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
                        <MainNavi isOpen={open} isMobile={mobile} onToogle={handleToogle}/>
                        <ContactBtn href="./contact" className={`${mobile ? 'is-mobile' : ''}`}>
                            {mobile ? (
                                <MailIcon src="/svg/e-mail.svg" alt="mail me" width={35} height={35} />
                            ) : (
                                'Contact me'
                            )}
                        </ContactBtn>
                        {mobile &&
                            <StyledNavBtn onClick={handleToogle} className={`${open ? 'is-open' : ''}`}>
                                <StyledBurgerBars className={'top'}/>
                                <StyledBurgerBars className={'middle'}/>
                                <StyledBurgerBars className={'bottom'}/>
                            </StyledNavBtn>
                        }
                        {showOverlay && <StyledOverlay onClick={handleToogle}></StyledOverlay>}
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

const MailIcon = styled(Image)`
  position: relative;
  top: -5px;
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
  background: rgba(214, 213, 213, .6);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
`;

const StyledNavBtn = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 20;
  right: 10px;
  width: 32px;
  height: 25px;
  justify-content: space-between;
  
  &.is-open {
    position: fixed;

    .top {
      transform: rotate(45deg);
    }
    .bottom {
      transform: rotate(-45deg);
    }
    .middle {
      opacity: 0;
      width: 0;
      margin-left: -.75rem;
    }
  }
`;

const StyledBurgerBars = styled.div`
  width: 32px;
  height: 0.25rem;
  background: #4f4f4f;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
`;

