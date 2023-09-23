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
import {
    SiAdobeacrobatreader,
    SiAdobecreativecloud,
    SiAdobeillustrator, SiAdobeindesign,
    SiAdobephotoshop, SiAdobexd,
    SiContao, SiFigma,
    SiNextdotjs,
    SiPhpstorm,
    SiShopware,
    SiSymfony, SiWebstorm,
    SiWordpress
} from "react-icons/si";
import {PiGitlabLogo} from "react-icons/pi";
import {AiOutlineCopyrightCircle} from "react-icons/ai";
import {roboto_condensed} from "@/app/fonts";

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
                                <h3 className={roboto_condensed.className}>Webdevelopment</h3>
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
                                <h3 className={roboto_condensed.className}>CMS & Frameworks</h3>
                                <TecIcons>
                                    <SiSymfony />
                                    <SiNextdotjs />
                                    <SiContao />
                                    <SiWordpress />
                                    <SiShopware />
                                </TecIcons>
                            </div>
                            <div className="col-12 col-md-6 col-xl-4 columns">
                                <h3 className={roboto_condensed.className}>Software</h3>
                                <TecIcons>
                                    <SiAdobephotoshop />
                                    <SiAdobeillustrator />
                                    <SiAdobeindesign />
                                    <SiAdobexd />
                                    <SiPhpstorm />
                                    <SiWebstorm />
                                </TecIcons>
                                <h3 className={roboto_condensed.className}>Social Media</h3>
                                <SocialIcons>
                                    <Link href="https://github.com/Wizzard26" target="_blank"><BiLogoGithub /></Link>
                                    <Link href="https://www.linkedin.com/in/rene-van-dinter-6a5a2b14a/" target="_blank"><BiLogoLinkedin /></Link>
                                    <Link href="https://www.xing.com/profile/Rene_vanDinter/cv" target="_blank"><BiLogoXing /></Link>
                                    <Link href="https://www.facebook.com/Wizzard26" target="_blank"><BiLogoFacebook /></Link>
                                    <Link href="https://www.instagram.com/rene.vandinter/" target="_blank"><BiLogoInstagram /></Link>
                                </SocialIcons>
                            </div>
                            <div className="col-12 col-md-6 col-xl-4 columns navigation">
                                <h3 className={roboto_condensed.className}>Navigation</h3>
                                    <ul>
                                        <li><Link href="/" className={roboto_condensed.className}>Home</Link></li>
                                        <li><Link href="/about-me" className={roboto_condensed.className}>About me</Link></li>
                                        <li><Link href="/vita" className={roboto_condensed.className}>Vita</Link></li>
                                        <li><Link href="/showcase" className={roboto_condensed.className}>Showcase</Link></li>
                                        <li><Link href="/blog" className={roboto_condensed.className}>Blog</Link></li>
                                        <li><Link href="/contact" className={roboto_condensed.className}>Contact</Link></li>
                                        <li><Link href="/disclaimer" className={roboto_condensed.className}>Disclaimer</Link></li>
                                        <li><Link href="/imprint" className={roboto_condensed.className}>Imprint</Link></li>
                                    </ul>
                            </div>
                        </div>

                    </div>
                    <StyledEndLine>
                        <AiOutlineCopyrightCircle style={{position:'relative',top:'3px'}} /> Copyright {yearStart} - {yearNow} | Design, Code and Content by Rene van Dinter | all rights reserved
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

    a {
      transition: all 300ms ease-in-out;
      
      &:hover {
        color: #ece1b4;
      }
    }
    
    &.navigation {
      ul {
        list-style: none;
        padding: 0;
        column-count: 2;
        
        li {
          text-transform: uppercase;
          transition: all 300ms ease-in-out;
          
          a {
            font-weight: 200;
            font-size: 20px;
            line-height: 32px;
            position: relative;

            &:after {
              content: "";
              width: 0;
              height: 1px;
              display: block;
              background-color: #f1f1f1;
              position: absolute;
              bottom: -2px;
              left:50%;
              transition: all 400ms ease-in-out;
            }
          }

          &:hover {
            text-indent: 10px;

            a:after {
              width: calc(100% + 20px);
              left: -10px;
            }
          }
        }
      }
    }
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

