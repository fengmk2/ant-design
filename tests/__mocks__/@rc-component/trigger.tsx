import * as React from 'react';
import type { TriggerProps, TriggerRef } from '@rc-component/trigger';
import MockTrigger from '@rc-component/trigger/lib/mock';
import ActualTrigger from '@rc-component/trigger';

import { TriggerMockContext } from '../../shared/demoTestContext';

const OriginTrigger = (ActualTrigger as any).default ?? ActualTrigger;

const ForwardTrigger = React.forwardRef<TriggerRef, TriggerProps>((props, ref) => {
  const context = React.useContext(TriggerMockContext);

  const mergedPopupVisible = context?.popupVisible ?? props.popupVisible;
  (global as any).triggerProps = props;

  const mergedProps: TriggerProps = {
    ...props,
    popupVisible: mergedPopupVisible,
  };

  if (context?.mock === false) {
    return <OriginTrigger ref={ref} {...mergedProps} />;
  }
  return <MockTrigger ref={ref} {...mergedProps} />;
});

export * from '@rc-component/trigger/lib/mock';

export default ForwardTrigger;
