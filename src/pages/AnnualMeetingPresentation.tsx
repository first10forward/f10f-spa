import { useEffect, useState } from 'react'
import './AnnualMeetingPresentation.css'

const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const additions = [14, 3, 2, 11, 4, 5, 16, 2, 3]
const members = additions.reduce<number[]>((totals, count) => {
  totals.push((totals.at(-1) ?? 0) + count)
  return totals
}, [])
const paidMemberships = [12.5, 15, 15, 24, 27, 30, 37, 26.5, 26]
const donations = [12501, 15000, 16000, 25000, 27000, 30250, 37200, 27500, 27700]
const donationsToDate = donations.slice(0, -1).reduce((total, amount) => total + amount, 0)
const recipients = [
  { year: 2025, name: 'MOWIT (Missouri Women in Trades)', href: 'https://www.mowit.org/', image: '25-grantee.jpg' },
  { year: 2024, name: 'Sea Sisters', href: 'https://www.seasisters.org/', image: '24-grantee_2.jpg' },
  { year: 2023, name: 'CMA Education Foundation', href: 'https://cma-edu.org' },
  { year: 2022, name: 'One Year to Empowerment', href: 'https://oneyeartoempowerment.org/', image: '22-grantee.jpg' },
  { year: 2021, name: 'Women Offshore', href: 'https://womenoffshore.org/' },
  { year: 2020, name: 'AAUW NJ Tech Trek', href: 'https://www.aauw.org/resources/programs/tech-trek/', image: '20-grantee.jpg' },
  { year: 2019, name: 'Eureka Program, Girls Inc. of San Antonio', href: 'https://www.girlsincsa.org/', image: '21-grantee.jpg' },
  { year: 2019, name: 'Bel Inizio', href: 'https://bel-inizio.org/' },
  { year: 2018, name: 'Containerization and Intermodal Institute', href: 'https://www.containerization.org/scholarships', image: '18-grantee.jpg' },
]
const nominees = [
  ['Girls in Gear', 'https://www.girlsingear.org/'],
  ['MIB Agents Osteosarcoma Alliance', 'https://www.mibagents.org/'],
  ['WIMOs (Women in Maritime Organizations)', 'https://www.wimos.org/'],
  ['Women in Aviation International', 'https://www.wai.org/'],
]

function AnnualMeetingPresentation() {
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const count = 12
  const goTo = (slide: number) => setActive(Math.max(0, Math.min(count - 1, slide)))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('a, button')) return
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); setActive((slide) => Math.min(count - 1, slide + 1)) }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); setActive((slide) => Math.max(0, slide - 1)) }
      if (event.key === 'Home') setActive(0)
      if (event.key === 'End') setActive(count - 1)
      if (event.key.toLowerCase() === 'f') document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()
    }
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFullscreen) }
  }, [])

  const slides = [
    <section className="meeting-slide film-slide" aria-label="Opening film">
      <iframe src="/video/presentation.html" title="First10Forward opening film" allow="fullscreen" />
      {!fullscreen && <button className="film-continue" onClick={() => goTo(1)}>Continue to meeting <i className="fas fa-arrow-right" aria-hidden="true" /></button>}
    </section>,
    <section className="meeting-slide agenda-slide" aria-label="Meeting agenda">
      <p className="meeting-kicker">2026 · Savannah, Georgia</p><h1>Annual Members Meeting</h1>
      <div className="agenda-layout"><ol className="agenda-list">
        <li><span>01</span> Welcome</li><li><span>02</span> Our history &amp; mission</li><li><span>03</span>Treasurer's report</li><li><span>04</span>Governance Committee</li><li><span>05</span>Nominations Committee</li><li><span>06</span>Grant recipients</li><li><span>07</span>Members meeting</li></ol></div>
    </section>,
    <section className="meeting-slide history-slide" aria-label="Our history">
      <p className="meeting-kicker">Where we began</p><h2>Fourteen women.<br />One shared promise.</h2>
      <p>First10Forward took shape after conversations at the 2016 Kings Point golf outing and Homecoming. In July 2017, fourteen graduates gathered in St. Croix and committed to support women and girls pursuing nontraditional careers.</p>
      <p><i>We have carried that mission forward ever since.</i></p>
      <span className="history-caption">Kings Point welcomed women to its Regiment of Midshipmen in 1974.</span>
    </section>,
    <section className="meeting-slide mission-slide" aria-label="Our mission">
      <p className="meeting-kicker">Our mission</p><h2>Open doors. Pass opportunity forward.</h2>
      <div className="mission-guarantee"><strong>100%</strong><p>of membership fees go to the awarded recipient.</p></div>
      <p className="mission-statement">We advance the professional goals of women and girls pursuing non-traditional careers.</p>
      <p className="mission-detail">Members nominate eligible organizations and choose one recipient for the Annual Grant.</p>
    </section>,
    <section className="meeting-slide chart-slide" aria-label="Membership growth">
      <div className="slide-heading-row"><div><p className="meeting-kicker">Growing together</p><h2>Our membership</h2></div><div className="chart-stat"><strong>{members.at(-1)}</strong><span>women participating</span></div></div>
      <p className="chart-legend"><span className="legend-participants" /> Alumnae participated (cumulative) <b><span className="legend-paid" /> Paid memberships (annual)</b></p>
      <div className="member-chart" role="img" aria-label={`Women participating cumulatively and paid memberships by year: ${years.map((year, index) => `${year}, ${members[index]} women participated, ${paidMemberships[index].toLocaleString('en-US')} paid memberships`).join('; ')}`}>
        {years.map((year, index) => <div className="member-column" key={year}>
          <div className="member-values"><span className="member-value-participated">{members[index]}</span><span className="member-value-paid">{paidMemberships[index].toLocaleString('en-US')}</span></div>
          <div className="member-bars"><div className="member-bar-wrap"><div className="member-bar" style={{ height: `${members[index] / 60 * 100}%` }} /></div><div className="member-bar-wrap"><div className="member-bar member-bar-paid" style={{ height: `${paidMemberships[index] / 40 * 100}%` }} /></div></div>
          <span className="member-added">+{additions[index]} new</span><span className="chart-year">{year}</span>
        </div>)}
      </div><p className="chart-footnote">Cumulative participation · paid memberships by year · additions shown as +N</p>
    </section>,
    <section className="meeting-slide chart-slide" aria-label="Annual donations">
      <div className="slide-heading-row"><div><p className="meeting-kicker">Fueling the mission</p><h2>Annual giving</h2></div><div className="chart-stat"><strong>${donationsToDate.toLocaleString('en-US')}</strong><span>to date</span></div></div>
      <div className="donation-chart" role="img" aria-label="Donations in dollars: 2018 $12,501; 2019 $15,000; 2020 $16,000; 2021 $25,000; 2022 $27,000; 2023 $30,250; 2024 $37,200; 2025 $27,500; 2026 $22,700">
        {years.map((year, index) => <div className="donation-column" key={year}>
          <div className="donation-plot"><span className="donation-value" style={{ bottom: `calc(${donations[index] / 40000 * 100}% + 4px)` }}>${donations[index].toLocaleString('en-US')}</span><div className="donation-bar" style={{ height: `${donations[index] / 40000 * 100}%` }} /></div>
          <span className="chart-year">{year}</span>
        </div>)}
      </div><p className="chart-footnote">Annual donations in USD · Hatched 2026 bar is not yet awarded</p>
    </section>,
    <section className="meeting-slide governance-slide treasurer-slide" aria-label="Treasurer's Report">
      <h2>Treasurer's Report</h2>
    </section>,
    <section className="meeting-slide governance-slide" aria-label="Governance Committee">
      <h2>Governance Committee</h2>
      <p className="committee-subheading">Open Board Seats</p>
    </section>,
    <section className="meeting-slide nominations-committee-slide" aria-label="Nominations Committee">
      <h2>Nominations Committee</h2>
    </section>,
    <section className="meeting-slide recipient-slide" aria-label="Past grant recipients">
      <p className="meeting-kicker">A decade of impact</p><h2>Grants at work</h2>
      <div className="recipient-layout">
        <ol className="recipient-list">{recipients.map((recipient) => <li key={`${recipient.year}-${recipient.name}`}>
          <span>{recipient.year}{recipient.year === 2019 ? ' · shared' : ''}</span><a href={recipient.href} target="_blank" rel="noreferrer">{recipient.name}</a>
        </li>)}</ol>
        <div className="recipient-collage" aria-label="Photos from past grant presentations">
          {recipients.filter((recipient) => recipient.image).map((recipient, index) => <a className={`collage-item collage-item-${index + 1}`} href={recipient.href} target="_blank" rel="noreferrer" aria-label={`View ${recipient.name}`} key={`${recipient.year}-${recipient.name}`}>
            <img src={`/img/photos/${recipient.image}`} alt="" /><span>{recipient.year}</span>
          </a>)}
        </div>
      </div>
    </section>,
    <section className="meeting-slide nomination-details-slide" aria-label="2026 nominees and pitch rules">
      <p className="meeting-kicker">2026 Annual Grant</p><h2>Nominees &amp; pitch</h2>
      <div className="nomination-details">
        <ol className="nominee-list">{nominees.map(([name, href], index) => <li key={name}><span>0{index + 1}</span><a href={href} target="_blank" rel="noreferrer">{name}<i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /></a></li>)}</ol>
        <aside className="nomination-rules">
          <div><strong>6 minutes</strong><span>Oral pitch per nominee</span></div>
          <div><strong>No visual aids</strong><span>No technology, photos, or other visuals</span></div>
          <p>Disclose any personal or professional interest before voting.</p>
          <p>Eligible nonprofits must be qualified 501(c)(3) organizations.</p>
        </aside>
      </div>
    </section>,
    <section className="meeting-slide thank-you-slide" aria-label="Thank you">
      <aside className="thank-you-box"><p>Thank you for carrying the mission forward.</p></aside>
    </section>,
  ]

  return <main className="meeting-presentation" aria-label="First10Forward 2026 annual members meeting presentation"><div className="meeting-stage">
    {slides.map((slide, index) => <div className={`meeting-frame${index === active ? ' is-active' : ''}`} key={index} aria-hidden={index !== active}>{slide}</div>)}
    <nav className="meeting-controls" aria-label="Presentation controls">
      <a href="/app" aria-label="Exit presentation"><i className="fas fa-arrow-left" aria-hidden="true" /></a>
      <div className="meeting-progress"><span><i style={{ width: `${(active + 1) / count * 100}%` }} /></span>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</div>
      <div className="meeting-actions">
        <button onClick={() => window.print()} aria-label="Print slides"><i className="fas fa-print" aria-hidden="true" /></button>
        <button onClick={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen()} aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}><i className={fullscreen ? 'fas fa-compress' : 'fas fa-expand'} aria-hidden="true" /></button>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous slide"><i className="fas fa-arrow-left" aria-hidden="true" /></button>
        <button onClick={() => goTo(active + 1)} disabled={active === count - 1} aria-label="Next slide"><i className="fas fa-arrow-right" aria-hidden="true" /></button>
      </div>
    </nav>
  </div></main>
}

export default AnnualMeetingPresentation
