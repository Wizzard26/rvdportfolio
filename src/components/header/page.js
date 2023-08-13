'use client';
import { roboto, roboto_condensed } from "@/app/fonts";
import Link from "next/link";
import styled from "styled-components";
import MainNavi from "@/components/mainnavi/page";
import { ContactBtn } from "@/components/ContactBtn";
import StyledComponentsRegistry from "@/lib/registry";

export default function Header() {
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