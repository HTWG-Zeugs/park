import Card from "@mui/joy/Card";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Card variant="soft">
      <div>
        <h1>{t("route_home.title")}</h1>
        <p>
          {t("route_home.intro")}
          <br />
          {t("route_home.objectivesTitle")}
        </p>

        <ul>
          <li>
            <b>{t("route_home.objectives.integration.title")}:</b>{" "}
            {t("route_home.objectives.integration.description")}
          </li>
          <li>
            <b>{t("route_home.objectives.management.title")}:</b>{" "}
            {t("route_home.objectives.management.description")}
          </li>
          <li>
            <b>{t("route_home.objectives.analytics.title")}:</b>{" "}
            {t("route_home.objectives.analytics.description")}
          </li>
          <li>
            <b>{t("route_home.objectives.charging.title")}:</b>{" "}
            {t("route_home.objectives.charging.description")}
          </li>
          <li>
            <b>{t("route_home.objectives.deployment.title")}:</b>{" "}
            {t("route_home.objectives.deployment.description")}
          </li>
        </ul>
      </div>
    </Card>
  );
}
