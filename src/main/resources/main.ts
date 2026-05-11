// ! Eager-load /lib/cron at OSGi activation so its LibCronHandler bean captures a clean
// activation-thread Context (no Jetty request bound). If the first require happens later
// from a WS/HTTP thread, the captured defaultContext references a Jetty Request that
// goes stale, and every subsequent cron.schedule() NPEs in XP 8 / Jetty 12.
import '/lib/cron';

import { validateOptions as validateGoogleOptions } from './lib/google/options';

validateGoogleOptions();
