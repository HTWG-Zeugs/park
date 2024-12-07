import { FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "src/components/contact/Contact.css";

export default function ContactComponent() {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t("component_contact.headline")}</h1>
      <p className="course-info">
        {t("component_contact.p1_1")}{" "}
        <strong>{t("component_contact.p1_strong")}</strong>{" "}
        {t("component_contact.p1_2")}
      </p>
      <p className="contact-info">{t("component_contact.p2_1")}</p>
      <ul className="contact-list" style={{ margin: "auto" }}>
        <li>
          <FaEnvelope className="icon" />
          {t("component_contact.li1_name")}{" "}
          <a href="mailto:lukas.benner@htwg-konstanz.de">
            {t("component_contact.li1_mail")}
          </a>
        </li>
        <li>
          <FaEnvelope className="icon" />
          {t("component_contact.li2_name")}{" "}
          <a href="mailto:lukas.epple@htwg-konstanz.de">
            {t("component_contact.li2_mail")}
          </a>
        </li>
        <li>
          <FaEnvelope className="icon" />
          {t("component_contact.li3_name")}{" "}
          <a href="mailto:jonas.elsper@htwg-konstanz.de">
            {t("component_contact.li3_mail")}
          </a>
        </li>
      </ul>
    </>
  );
}
