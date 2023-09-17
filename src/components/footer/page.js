'use client';
import Link from "next/link";
import styled from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";
import {
    DiCss3,
    DiHtml5,
    DiJavascript,
    DiNodejsSmall,
    DiReact,
    DiNpm,
    DiPhp,
    DiLess,
    DiSass,
    DiGithubBadge
} from "react-icons/di";
import {BiLogoDocker, BiLogoFacebook, BiLogoGithub, BiLogoInstagram, BiLogoLinkedin, BiLogoXing} from "react-icons/bi";
import {SiContao, SiNextdotjs, SiShopware, SiSymfony, SiWordpress} from "react-icons/si";
import {PiGitlabLogo} from "react-icons/pi";
import {AiOutlineCopyrightCircle} from "react-icons/ai";

export default function Footer() {
    const yearStart = 2013;
    const yearNow = new Date().getFullYear();

    return(
        <>
            <StyledComponentsRegistry>
                <StyledFooter>
                    <div className="content-inner">
                        <div className="row">
                            <div className="col-12 col-md-6 col-xl-4 columns">
                                <h3>Webdevelopment</h3>
                                <TecIcons>
                                    <DiHtml5 />
                                    <DiCss3 />
                                    <DiJavascript />
                                    <DiNpm />
                                    <DiNodejsSmall />
                                    <DiReact />
                                    <DiPhp />
                                    <DiLess />
                                    <DiSass />
                                    <BiLogoDocker />
                                    <DiGithubBadge />
                                    <PiGitlabLogo />
                                </TecIcons>
                                <h3>CMS & Frameworks</h3>
                                <TecIcons>
                                    <SiSymfony />
                                    <SiNextdotjs />
                                    <SiContao />
                                    <SiWordpress />
                                    <SiShopware />
                                </TecIcons>
                            </div>
                            <div className="col-12 col-md-6 col-xl-4 columns">
                                <h3>Social Media</h3>
                                <SocialIcons>
                                    <Link href="https://www.gambit24.de" target="_blank"><BiLogoGithub /></Link>
                                    <Link href="https://www.gambit24.de" target="_blank"><BiLogoLinkedin /></Link>
                                    <Link href="https://www.gambit24.de" target="_blank"><BiLogoXing /></Link>
                                    <Link href="https://www.gambit24.de" target="_blank"><BiLogoFacebook /></Link>
                                    <Link href="https://www.gambit24.de" target="_blank"><BiLogoInstagram /></Link>
                                </SocialIcons>
                            </div>
                        </div>

                    </div>
                    <StyledEndLine>
                        <AiOutlineCopyrightCircle /> Copyright {yearStart} - {yearNow} | Design, Code and Content by Rene van Dinter | all rights reserved
                    </StyledEndLine>
                </StyledFooter>
            </StyledComponentsRegistry>
        </>
    )
}

const StyledFooter = styled.footer`
  width: 100%;
  min-height: 40px;
  position: relative;
  left: 0;
  bottom: 0;
  background-color: var(--primary);
  color: var(--fontlight);
  
  .columns {
    padding: 15px 0 25px;
  }
`;

const StyledEndLine = styled.div`
  width: 100%;
  background-color: var(--dark);
  padding: 3px 15px;
  text-align: center;
`;

const TecIcons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  svg {
    height: 40px;
    width: auto;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  svg {
    height: 40px;
    width: auto;
  }
`;

