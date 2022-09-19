import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useRolesHook from '../../../utils/api/roles'
import { Spinner, Pagination, Message, Confirm } from '../../../components'
import {
  inputMultipleCheckBox,
  inputText,
  inputTextArea,
} from '../../../utils/dynamicForm'
import TableView from '../../../components/TableView'
import FormView from '../../../components/FormView'
import usePermissionsHook from '../../../utils/api/permissions'
import useClientPermissionsHook from '../../../utils/api/clientPermissions'

const Roles = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getRoles, postRole, updateRole, deleteRole } = useRolesHook({
    page,
    q,
  })

  const { getPermissions } = usePermissionsHook({
    limit: 1000000,
  })
  const { getClientPermissions } = useClientPermissionsHook({
    limit: 1000000,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      auth: true,
    },
  })

  const { data, isLoading, isError, error, refetch } = getRoles
  const { data: permissionData } = getPermissions
  const { data: clientPermissionData } = getClientPermissions

  const uniquePermissions = [
    ...(new Set(
      permissionData?.data?.map((item: { name: string }) => item.name)
    ) as any),
  ]?.map((group) => ({
    [group]: permissionData?.data?.filter(
      (permission: { name: string }) => permission?.name === group
    ),
  }))

  const uniqueClientPermissions = [
    ...(new Set(
      clientPermissionData?.data?.map((item: { menu: string }) => item.menu)
    ) as any),
  ]?.map((group) => ({
    [group]: clientPermissionData?.data?.filter(
      (clientPermission: { menu: string }) => clientPermission?.menu === group
    ),
  }))

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateRole

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteRole

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postRole

  useEffect(() => {
    if (isSuccessPost || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessPost, isSuccessUpdate])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    refetch()
    setPage(1)
  }

  // TableView
  const table = {
    header: ['Name', 'Type', 'Description'],
    body: ['name', 'type', 'description'],
    createdAt: 'createdAt',
    data: data,
  }

  interface Item {
    [x: string]: any
    _id: any
    permission: any[]
    clientPermission: { menu: string }[]
  }
  const editHandler = (item: Item) => {
    setId(item._id)

    table.body.map((t) => setValue(t as any, item[t]))
    setEdit(true)

    const permission = [
      ...(new Set(item?.permission?.map((item) => item.name)) as any),
    ]
      ?.map((group) => ({
        [group]: item?.permission?.filter(
          (permission) => permission?.name === group
        ),
      }))
      ?.map((per) => {
        setValue(
          `permission-${Object.keys(per)[0]}` as any,
          Object.values(per)[0]?.map((per: { _id: string }) => per?._id)
        )
      })

    const clientPermission = [
      ...(new Set(
        item.clientPermission?.map((item: { menu: string }) => item.menu)
      ) as any),
    ]
      ?.map((group) => ({
        [group]: item?.clientPermission?.filter(
          (clientPermission: { menu: any }) => clientPermission?.menu === group
        ),
      }))
      ?.map((per) => {
        setValue(
          `clientPermission-${Object.keys(per)[0]}` as any,
          Object.values(per)[0]?.map((p: any) => p?._id)
        )
      })
  }

  const deleteHandler = (id: string) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Roles List'
  const label = 'Role'
  const modal = 'role'
  const searchPlaceholder = 'Search by name'

  // FormView
  const formCleanHandler = () => {
    reset(), setEdit(false)
  }

  const submitHandler = (data: {
    [x: string]: any
    name?: any
    description?: any
  }) => {
    const permission = Object.keys(data)
      .filter((key) => key.startsWith('permission-'))
      ?.map((key) => data[key])
      ?.filter((value) => value)
      ?.join(',')
      .split(',')

    const clientPermission = Object.keys(data)
      .filter((key) => key.startsWith('clientPermission-'))
      ?.map((key) => data[key])
      ?.filter((value) => value)
      ?.join(',')
      .split(',')

    edit
      ? mutateAsyncUpdate({
          _id: id,
          name: data.name,
          permission,
          clientPermission,
          description: data.description,
        })
      : mutateAsyncPost({
          _id: id,
          name: data.name,
          permission,
          clientPermission,
          description: data.description,
        })
  }

  const form = [
    <div key={0} className='col-12'>
      {inputText({
        register,
        errors,
        label: 'Name',
        name: 'name',
        placeholder: 'Enter name',
      })}
    </div>,

    <div key={1} className='col-12'>
      {uniquePermissions?.length > 0 &&
        uniquePermissions?.map((g, i) => (
          <div key={i} className='mb-1'>
            <label className='fw-bold text-uppercase'>
              {uniquePermissions?.length > 0 && Object.keys(g)[0]}
            </label>

            {inputMultipleCheckBox({
              register,
              errors,
              label: `${uniquePermissions?.length > 0 && Object.keys(g)[0]}`,
              name: `permission-${
                uniquePermissions?.length > 0 && Object.keys(g)[0]
              }`,
              placeholder: `${
                uniquePermissions?.length > 0 && Object.keys(g)[0]
              }`,
              data:
                uniquePermissions?.length > 0 &&
                Object.values(g)[0]?.map(
                  (item: { method: any; description: any; _id: any }) => ({
                    name: `${item.method} - ${item.description}`,
                    _id: item._id,
                  })
                ),
              isRequired: false,
            })}
          </div>
        ))}
    </div>,

    <div key={2} className='col-12'>
      {inputTextArea({
        register,
        errors,
        label: 'Description',
        name: 'description',
        placeholder: 'Description',
      })}
    </div>,

    <div key={3} className='col-12'>
      {uniqueClientPermissions?.length > 0 &&
        uniqueClientPermissions?.map((g, i) => (
          <div key={i} className='mb-1'>
            <label className='fw-bold text-uppercase'>
              {uniqueClientPermissions?.length > 0 && Object.keys(g)[0]}
            </label>

            {inputMultipleCheckBox({
              register,
              errors,
              label: `${
                uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
              }`,
              name: `clientPermission-${
                uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
              }`,
              placeholder: `${
                uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
              }`,
              data:
                uniqueClientPermissions?.length > 0 &&
                Object.values(g)[0]?.map(
                  (item: { menu: any; path: any; _id: any }) => ({
                    name: `${item.menu} - ${item.path}`,
                    _id: item._id,
                  })
                ),
              isRequired: false,
            })}
          </div>
        ))}
    </div>,
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Roles</title>
        <meta property='og:title' content='Roles' key='title' />
      </Head>

      {isSuccessDelete && (
        <Message variant='success'>
          {label} has been cancelled successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {isSuccessUpdate && (
        <Message variant='success'>
          {label} has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessPost && (
        <Message variant='success'>
          {label} has been Created successfully.
        </Message>
      )}
      {isErrorPost && <Message variant='danger'>{errorPost}</Message>}

      <div className='ms-auto text-end'>
        <Pagination data={table.data} setPage={setPage} />
      </div>

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={isLoadingPost}
        handleSubmit={handleSubmit}
        submitHandler={submitHandler}
        modal={modal}
        label={label}
        modalSize={modalSize}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <TableView
          table={table}
          editHandler={editHandler}
          deleteHandler={deleteHandler}
          searchHandler={searchHandler}
          isLoadingDelete={isLoadingDelete}
          name={name}
          label={label}
          modal={modal}
          setQ={setQ}
          q={q}
          searchPlaceholder={searchPlaceholder}
          searchInput={true}
          addBtn={true}
        />
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Roles)), {
  ssr: false,
})
