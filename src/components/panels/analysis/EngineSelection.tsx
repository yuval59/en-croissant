import { activeTabAtom, enginesAtom } from "@/atoms/atoms";
import { Engine, stopEngine } from "@/utils/engines";
import {
  Center,
  Checkbox,
  Group,
  Image,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCloud,
  IconRobot,
} from "@tabler/icons-react";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { useAtom, useAtomValue } from "jotai";
import { memo } from "react";
import { Link } from "react-router-dom";
import useSWRImmutable from "swr/immutable";

function EngineBox({
  engine,
  toggleEnabled,
}: {
  engine: Engine;
  toggleEnabled: () => void;
}) {
  const activeTab = useAtomValue(activeTabAtom);

  const { data: imageSrc } = useSWRImmutable(engine.image, async (image) => {
    if (image?.startsWith("http")) {
      return image;
    }
    if (image) {
      return await convertFileSrc(image);
    }
  });

  return (
    <Paper
      withBorder
      p="sm"
      w="100%"
      h="3rem"
      onClick={() => {
        if (engine.loaded && engine.type === "local") {
          stopEngine(engine, activeTab!);
        }
        toggleEnabled();
      }}
      style={{ cursor: "pointer" }}
    >
      <Group wrap="nowrap">
        <Checkbox checked={!!engine.loaded} onChange={() => {}} />
        {imageSrc ? (
          <Image src={imageSrc} alt={engine.name} h="1.5rem" />
        ) : engine.type !== "local" ? (
          <IconCloud size="1.5rem" />
        ) : (
          <IconRobot size="1.5rem" />
        )}
        <Text lineClamp={1} fz="sm">
          {engine.name}
        </Text>
      </Group>
    </Paper>
  );
}

function EngineSelection() {
  const [engines, setEngines] = useAtom(enginesAtom);

  return (
    <>
      {engines.length === 0 && (
        <Center>
          <Text>
            No engines installed. Please{" "}
            <Link to="/engines">Add an engine</Link> first.
          </Text>
        </Center>
      )}

      <ScrollArea h={250} scrollbars="y">
        <Stack gap="xs" align="center" w="100%">
          {engines.map((engine) => (
            <EngineBox
              engine={engine}
              toggleEnabled={() => {
                setEngines(async (prev) =>
                  (await prev).map((e) =>
                    e.name === engine.name ? { ...e, loaded: !e.loaded } : e,
                  ),
                );
              }}
            />
          ))}
        </Stack>
      </ScrollArea>
    </>
  );
}

export default memo(EngineSelection);
