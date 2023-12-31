import {
  ArrowSmallLeftIcon,
  ArrowSmallRightIcon,
  PaperClipIcon,
} from "@heroicons/react/20/solid";
import ToggleSwitch from "./toggleswitch";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCityToApplication,
  getApplicationJeeStatus,
  getCityByApplication,
  getExamCities,
  removeCityFromApplication,
  updateApplicationJeeStatus,
} from "@/app/data/applicationclient";
import ApplicationCities from "./applicationcity";
import ApplicationConfirmation from "./applicationconfirmation";

export default function CityJee({ previousStep, nextStep, step, application }) {
  const [dataModified, setDataModified] = useState(false);
  const queryClient = useQueryClient();

  const { data: applicationCities, isLoading: applicationCitiesLoading } =
    useQuery({
      queryKey: ["cities", application.id],
      queryFn: () => getCityByApplication(application.id),
    });

  const { data: jeestatus, isLoading: jeeStatusLoading } = useQuery({
    queryKey: ["application", application.id, "jee"],
    queryFn: () => getApplicationJeeStatus(application.id),
  });

  const jeeStatusMutation = useMutation({
    mutationFn: (status) => {
      return updateApplicationJeeStatus(application.id, status);
    },
    onMutate: async (variables) => {
      const queryKey = ["application", application.id, "jee"];
      const previousData = queryClient.getQueryData(queryKey);

      const updatedData = { ...previousData, jee: variables };

      queryClient.setQueryData(queryKey, updatedData);

      const rollback = () => {
        queryClient.setQueryData(queryKey, previousData);
      };
      return { rollback };
    },
    onError: (error, variables, context) => {
      context.rollback();
    },
    onSuccess: (data, variables, context) => {
      context.rollback();
      queryClient.setQueryData(["application", application.id, "jee"], data);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries(["application", application.id, "jee"]);
    },
  });

  function changeJeeStatus(status) {
    jeeStatusMutation.mutate(status);
  }

  const { mutate: cityremovemutate, isLoading: cityremoveloading } =
    useMutation({
      mutationFn: (city) => {
        return removeCityFromApplication(application.id, city.examcityId);
      },
      onMutate: async (applicationcity) => {
        const queryKey = ["cities", application.id];
        const previousData = queryClient.getQueryData(queryKey);

        const updatedData = previousData.filter(
          (item) => item.id != applicationcity.id
        );

        queryClient.setQueryData(queryKey, updatedData);

        const rollback = () => {
          queryClient.setQueryData(queryKey, previousData);
        };
        return { rollback };
      },
      onError: (error, variables, context) => {
        context.rollback();
      },
      onSuccess(data, variables, context) {
        const { message } = data;
        if (message != "success") {
          context.rollback();
        }
      },
      onSettled: (data, error, variables, context) => {
        queryClient.invalidateQueries(["cities", application.id]);
      },
    });

  function removeCity(city) {
    cityremovemutate(city);
  }

  const { mutate: cityaddmutate, isLoading: cityaddloading } = useMutation({
    mutationFn: (id) => {
      return addCityToApplication(application.id, id);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries(["cities", application.id]);
    },
  });

  function addCity(id) {
    cityaddmutate(id);
  }

  useEffect(() => {
    console.log("selection mounted");
    setDataModified(false);

    return () => {
      console.log("selection unmounted");
    };
  }, []);

  async function moveNext() {
    await saveData();
    nextStep();
  }
  async function movePrevious() {
    await saveData();
    previousStep();
  }

  async function saveData() {
    if (dataModified) {
      console.log("selection save data");
    }
  }

  console.log(jeestatus);

  return (
    <div className="mt-10 mx-auto max-w-md sm:max-w-4xl">
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          City and JEE
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Select a city to appear for exam and your preference to consider JEE.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-200">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              City Preferences ( only 3 )
            </dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {applicationCitiesLoading ? (
                <p>Loading...</p>
              ) : (
                <ApplicationCities
                  applicationCities={applicationCities}
                  removeCity={removeCity}
                  application={application}
                  addCity={addCity}
                  cityaddloading={cityaddloading}
                  cityremoveloading={cityremoveloading}
                />
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Do you want to consider based on the JEE CRL Rank?
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {jeeStatusLoading ? (
                <p>Loading...</p>
              ) : (
                <ToggleSwitch
                  initialValue={jeestatus.jee}
                  changeStatus={changeJeeStatus}
                />
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-10 py-5 border-t border-gray-200 flex items-center justify-center gap-x-6">
          <button
            type="button"
            onClick={movePrevious}
            className="inline-flex items-center gap-x-2 rounded-md bg-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <ArrowSmallLeftIcon
              className="-ml-0.5 h-5 w-5"
              aria-hidden="true"
            />
            Previous
          </button>
          <button
            type="button"
            onClick={moveNext}
            className="inline-flex items-center gap-x-2 rounded-md bg-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            Next
            <ArrowSmallRightIcon
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
