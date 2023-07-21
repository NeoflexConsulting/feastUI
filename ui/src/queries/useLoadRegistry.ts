import { useQuery } from "react-query";
import {KeycloakInstance} from "keycloak-js";
import mergedFVTypes, { genericFVType } from "../parsers/mergedFVTypes";
import parseEntityRelationships, {
  EntityRelation,
} from "../parsers/parseEntityRelationships";
import parseIndirectRelationships from "../parsers/parseIndirectRelationships";
import { feast } from "../protos";
import {useKeycloak} from "@react-keycloak/ssr";
import { useToken } from '../contexts/TokenContext';

interface FeatureStoreAllData {
  project: string;
  description?: string;
  objects: feast.core.Registry;
  relationships: EntityRelation[];
  mergedFVMap: Record<string, genericFVType>;
  mergedFVList: genericFVType[];
  indirectRelationships: EntityRelation[];
}

const useLoadRegistry = (url: string) => {
  const {keycloak} = useKeycloak<KeycloakInstance>()
  const {tokenAuth} = useToken()
  const token = keycloak?.token || tokenAuth;
  return useQuery(
    `registry:${url}`,
    () => {
      return fetch(url, {
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Bearer ' + token,
        },
      })
        .then((res) => {
          return res.arrayBuffer();
        })
        .then<FeatureStoreAllData>((arrayBuffer) => {

          const objects = feast.core.Registry.decode(new Uint8Array(arrayBuffer));
          // const objects = FeastRegistrySchema.parse(json);

          const { mergedFVMap, mergedFVList } = mergedFVTypes(objects);

          const relationships = parseEntityRelationships(objects);

          // Only contains Entity -> FS or DS -> FS relationships
          const indirectRelationships = parseIndirectRelationships(
            relationships,
            objects
          );

          // console.log({
          //   objects,
          //   mergedFVMap,
          //   mergedFVList,
          //   relationships,
          //   indirectRelationships,
          // });

          return {
            project: objects.projectMetadata[0].project!,
            objects,
            mergedFVMap,
            mergedFVList,
            relationships,
            indirectRelationships,
          };
        });
    },
    {
      staleTime: Infinity, // Given that we are reading from a registry dump, this seems reasonable for now.
    }
  );
};

export default useLoadRegistry;
export type { FeatureStoreAllData };
